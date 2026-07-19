import type {
  DirektAuthenticatedSession,
  DirektRotatedSession,
  SessionView,
  SyntheticChallengeAccepted,
} from "@/lib/contracts/auth";
import { getCloudRunIdentityToken } from "./cloud-run-identity";
import { getDirektWebRuntimeConfig } from "./runtime-config";

export class DirektAuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly problem?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DirektAuthApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  accessToken?: string;
};

export class DirektAuthApi {
  private readonly baseUrl: URL;

  constructor() {
    const config = getDirektWebRuntimeConfig();
    if (!config.apiBaseUrl || config.apiMode !== "authenticated-bff") {
      throw new Error("DIREKT auth API requires the authenticated-bff private API boundary");
    }
    this.baseUrl = config.apiBaseUrl;
  }

  requestChallenge(input: {
    channel: "email" | "phone";
    contact: string;
  }): Promise<SyntheticChallengeAccepted> {
    return this.request("/api/v1/auth/challenges", { method: "POST", body: input });
  }

  verifyChallenge(input: {
    challengeId: string;
    code: string;
    deviceLabel?: string;
  }): Promise<DirektAuthenticatedSession> {
    return this.request("/api/v1/auth/challenges/verify", { method: "POST", body: input });
  }

  exchangeFirebase(input: {
    idToken: string;
    noticeVersion: string;
    consentAccepted: true;
    deviceLabel?: string;
  }): Promise<DirektAuthenticatedSession> {
    return this.request("/api/v1/auth/firebase/exchange", { method: "POST", body: input });
  }

  rotateSession(refreshToken: string): Promise<DirektRotatedSession> {
    return this.request("/api/v1/auth/sessions/rotate", {
      method: "POST",
      body: { refreshToken },
    });
  }

  listSessions(accessToken: string): Promise<SessionView[]> {
    return this.request("/api/v1/auth/sessions", { accessToken });
  }

  revokeOtherSessions(accessToken: string): Promise<{ revokedCount: number }> {
    return this.request("/api/v1/auth/sessions/revoke-others", {
      method: "POST",
      accessToken,
    });
  }

  revokeSession(
    accessToken: string,
    sessionId: string,
    reason?: string,
  ): Promise<{ revoked: true; sessionId: string }> {
    return this.request(`/api/v1/auth/sessions/${encodeURIComponent(sessionId)}/revoke`, {
      method: "POST",
      accessToken,
      body: reason ? { reason } : {},
    });
  }

  getAccountProfile(accessToken: string): Promise<Record<string, unknown>> {
    return this.request("/api/v1/account/profile", { accessToken });
  }

  async hasProviderWorkspace(accessToken: string): Promise<boolean> {
    try {
      await this.request("/api/v1/provider-workspace/me", { accessToken });
      return true;
    } catch (error) {
      if (error instanceof DirektAuthApiError && (error.status === 403 || error.status === 404)) {
        return false;
      }
      throw error;
    }
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (url.origin !== this.baseUrl.origin) {
      throw new Error("DIREKT auth request path escaped the configured API origin");
    }

    const infrastructureToken = await getCloudRunIdentityToken(this.baseUrl);
    const headers: Record<string, string> = {
      accept: "application/json",
      "user-agent": "direkt-functional-web/0.3",
      "X-Serverless-Authorization": `Bearer ${infrastructureToken}`,
    };
    if (options.accessToken) {
      headers.authorization = `Bearer ${options.accessToken}`;
    }
    if (options.body !== undefined) {
      headers["content-type"] = "application/json";
    }

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      let problem: Record<string, unknown> | undefined;
      try {
        problem = (await response.json()) as Record<string, unknown>;
      } catch {
        problem = undefined;
      }
      const title = typeof problem?.title === "string" ? problem.title : undefined;
      throw new DirektAuthApiError(
        title || `DIREKT auth API request failed with status ${response.status}`,
        response.status,
        problem,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}
