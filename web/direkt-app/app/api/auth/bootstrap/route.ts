import { NextResponse } from "next/server";
import { ensureCsrfToken, readBrowserSession } from "@/lib/server/browser-session";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const capabilities = getPublicRuntimeCapabilities();
  const csrfToken = await ensureCsrfToken();
  const session = await readBrowserSession();
  return NextResponse.json(
    {
      authMode: capabilities.authMode,
      participantAuthenticationEnabled: capabilities.participantAuthenticationEnabled,
      syntheticAuthenticationEnabled: capabilities.syntheticAuthenticationEnabled,
      firebaseExchangeEnabled: capabilities.firebaseExchangeEnabled,
      csrfToken,
      hasSession: Boolean(session),
    },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
