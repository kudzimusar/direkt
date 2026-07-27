import type { DirektAuthenticatedSession } from "@/lib/contracts/auth";
import type { AuthenticatedSessionResponseDto } from "../../../../clients/generated/typescript/src/models/AuthenticatedSessionResponseDto";
import type { FirebaseSessionExchangeDto } from "../../../../clients/generated/typescript/src/models/FirebaseSessionExchangeDto";

export type DirektFirebaseSessionExchangeInput = Omit<FirebaseSessionExchangeDto, "consentAccepted"> & {
  consentAccepted: true;
};

export type GeneratedAuthenticatedSessionResponse = AuthenticatedSessionResponseDto;

export function toDirektAuthenticatedSession(value: AuthenticatedSessionResponseDto): DirektAuthenticatedSession {
  if (value.tokenType !== "Bearer") {
    throw new Error("DIREKT auth response returned an unsupported token type");
  }
  if (value.contact.verified !== true) {
    throw new Error("DIREKT auth response did not confirm a verified contact");
  }
  if (value.contact.channel !== "email" && value.contact.channel !== "phone") {
    throw new Error("DIREKT auth response returned an unsupported contact channel");
  }

  return {
    identityId: value.identityId,
    sessionId: value.sessionId,
    accessToken: value.accessToken,
    accessTokenExpiresAt: value.accessTokenExpiresAt,
    refreshToken: value.refreshToken,
    refreshTokenExpiresAt: value.refreshTokenExpiresAt,
    tokenType: "Bearer",
    contact: {
      channel: value.contact.channel,
      displayHint: value.contact.displayHint,
      verified: true,
    },
  };
}
