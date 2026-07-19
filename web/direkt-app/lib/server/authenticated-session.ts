import { getUsableBrowserSession, type BrowserSessionMaterial } from "./browser-session";
import { DirektAuthApi } from "./direkt-auth-api";

export async function withAuthenticatedSession<T>(
  operation: (session: BrowserSessionMaterial, api: DirektAuthApi) => Promise<T>,
): Promise<T | null> {
  const session = await getUsableBrowserSession();
  if (!session) return null;
  return operation(session, new DirektAuthApi());
}
