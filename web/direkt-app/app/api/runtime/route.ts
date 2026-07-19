import { NextResponse } from "next/server";
import { getPublicRuntimeCapabilities } from "@/lib/server/runtime-config";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getPublicRuntimeCapabilities(), {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
