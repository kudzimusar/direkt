import { clearBrowserSession, getUsableBrowserSession, readBrowserSession, rotateBrowserSession, type BrowserSessionMaterial } from "./browser-session";
import { DirektAuthApi, DirektAuthApiError } from "./direkt-auth-api";

export async function withAuthenticatedSession<T>(
  operation: (session: BrowserSessionMaterial, api: DirektAuthApi) => Promise<T>,
): Promise<T | null> {
  let session = await getUsableBrowserSession();
  if (!session) return null;
  const api = new DirektAuthApi();

  try {
    return await operation(session, api);
  } catch (error) {
    if (!(error instanceof DirektAuthApiError) || error.status !== 401) throw error;

    const latest = await readBrowserSession();
    if (!latest) return null;
    try {
      const rotated = await api.rotateSession(latest.refreshToken);
      await rotateBrowserSession(rotated);
      session = await readBrowserSession();
      if (!session) return null;
      return await operation(session, api);
    } catch (rotationError) {
      if (rotationError instanceof DirektAuthApiError && rotationError.status === 401) {
        await clearBrowserSession();
        return null;
      }
      throw rotationError;
    }
  }
}
