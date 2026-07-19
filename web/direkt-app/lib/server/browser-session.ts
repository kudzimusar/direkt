import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type {
  ContactChannel,
  DirektAuthenticatedSession,
  DirektRotatedSession,
} from "@/lib/contracts/auth";
import { DirektAuthApi, DirektAuthApiError } from "./direkt-auth-api";

const COOKIE_PREFIX = process.env.NODE_ENV === "production" ? "__Host-direkt-" : "direkt-";
const cookieName = (suffix: string) => `${COOKIE_PREFIX}${suffix}`;

const ACCESS = cookieName("access");
const ACCESS_EXP = cookieName("access-exp");
const REFRESH = cookieName("refresh");
const REFRESH_EXP = cookieName("refresh-exp");
const IDENTITY = cookieName("identity");
const SESSION = cookieName("session");
const CONTACT_CHANNEL = cookieName("contact-channel");
const CONTACT_HINT = cookieName("contact-hint");
const CSRF = cookieName("csrf");

const secure = process.env.NODE_ENV === "production";
const common = {
  path: "/",
  secure,
  sameSite: "strict" as const,
};

export interface BrowserSessionMaterial {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  identityId: string;
  sessionId: string;
  contact: {
    channel: ContactChannel | "unknown";
    displayHint: string;
  };
}

export async function establishBrowserSession(session: DirektAuthenticatedSession): Promise<void> {
  await writeSessionCookies(session, session.contact);
}

export async function rotateBrowserSession(session: DirektRotatedSession): Promise<void> {
  const current = await readBrowserSession();
  await writeSessionCookies(session, current?.contact ?? { channel: "unknown", displayHint: "Verified contact" });
}

export async function readBrowserSession(): Promise<BrowserSessionMaterial | null> {
  const store = await cookies();
  const accessToken = store.get(ACCESS)?.value;
  const accessTokenExpiresAt = store.get(ACCESS_EXP)?.value;
  const refreshToken = store.get(REFRESH)?.value;
  const refreshTokenExpiresAt = store.get(REFRESH_EXP)?.value;
  const identityId = store.get(IDENTITY)?.value;
  const sessionId = store.get(SESSION)?.value;
  if (
    !accessToken ||
    !accessTokenExpiresAt ||
    !refreshToken ||
    !refreshTokenExpiresAt ||
    !identityId ||
    !sessionId
  ) {
    return null;
  }
  const rawChannel = store.get(CONTACT_CHANNEL)?.value;
  const channel: ContactChannel | "unknown" =
    rawChannel === "email" || rawChannel === "phone" ? rawChannel : "unknown";
  return {
    accessToken,
    accessTokenExpiresAt,
    refreshToken,
    refreshTokenExpiresAt,
    identityId,
    sessionId,
    contact: {
      channel,
      displayHint: store.get(CONTACT_HINT)?.value || "Verified contact",
    },
  };
}

export async function getUsableBrowserSession(): Promise<BrowserSessionMaterial | null> {
  const current = await readBrowserSession();
  if (!current) return null;

  const refreshExpiry = Date.parse(current.refreshTokenExpiresAt);
  if (!Number.isFinite(refreshExpiry) || refreshExpiry <= Date.now()) {
    await clearBrowserSession();
    return null;
  }

  const accessExpiry = Date.parse(current.accessTokenExpiresAt);
  if (Number.isFinite(accessExpiry) && accessExpiry > Date.now() + 30_000) {
    return current;
  }

  try {
    const rotated = await new DirektAuthApi().rotateSession(current.refreshToken);
    await rotateBrowserSession(rotated);
    return await readBrowserSession();
  } catch (error) {
    if (error instanceof DirektAuthApiError && error.status === 401) {
      await clearBrowserSession();
      return null;
    }
    throw error;
  }
}

export async function clearBrowserSession(): Promise<void> {
  const store = await cookies();
  for (const name of [
    ACCESS,
    ACCESS_EXP,
    REFRESH,
    REFRESH_EXP,
    IDENTITY,
    SESSION,
    CONTACT_CHANNEL,
    CONTACT_HINT,
  ]) {
    store.set(name, "", { ...common, httpOnly: true, expires: new Date(0) });
  }
}

export async function ensureCsrfToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CSRF)?.value;
  if (existing && /^[A-Za-z0-9_-]{32,}$/.test(existing)) return existing;
  return rotateCsrfToken();
}

export async function rotateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const store = await cookies();
  store.set(CSRF, token, {
    ...common,
    httpOnly: false,
    maxAge: 60 * 60 * 8,
  });
  return token;
}

export function verifyCsrfToken(cookieValue: string | undefined, headerValue: string | null): boolean {
  if (!cookieValue || !headerValue) return false;
  const left = Buffer.from(cookieValue);
  const right = Buffer.from(headerValue);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function csrfCookieName(): string {
  return CSRF;
}

async function writeSessionCookies(
  session: DirektAuthenticatedSession | DirektRotatedSession,
  contact: { channel: ContactChannel | "unknown"; displayHint: string },
): Promise<void> {
  const store = await cookies();
  const accessMaxAge = secondsUntil(session.accessTokenExpiresAt, 60 * 15);
  const refreshMaxAge = secondsUntil(session.refreshTokenExpiresAt, 60 * 60 * 24 * 30);

  store.set(ACCESS, session.accessToken, { ...common, httpOnly: true, maxAge: accessMaxAge });
  store.set(ACCESS_EXP, session.accessTokenExpiresAt, {
    ...common,
    httpOnly: true,
    maxAge: refreshMaxAge,
  });
  store.set(REFRESH, session.refreshToken, { ...common, httpOnly: true, maxAge: refreshMaxAge });
  store.set(REFRESH_EXP, session.refreshTokenExpiresAt, {
    ...common,
    httpOnly: true,
    maxAge: refreshMaxAge,
  });
  store.set(IDENTITY, session.identityId, { ...common, httpOnly: true, maxAge: refreshMaxAge });
  store.set(SESSION, session.sessionId, { ...common, httpOnly: true, maxAge: refreshMaxAge });
  store.set(CONTACT_CHANNEL, contact.channel, { ...common, httpOnly: true, maxAge: refreshMaxAge });
  store.set(CONTACT_HINT, contact.displayHint, { ...common, httpOnly: true, maxAge: refreshMaxAge });
}

function secondsUntil(iso: string, fallback: number): number {
  const milliseconds = Date.parse(iso) - Date.now();
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return fallback;
  return Math.max(1, Math.floor(milliseconds / 1000));
}
