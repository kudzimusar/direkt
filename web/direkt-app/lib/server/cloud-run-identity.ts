const METADATA_IDENTITY_ENDPOINT =
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity";

export async function getCloudRunIdentityToken(audience: URL): Promise<string> {
  if (audience.protocol !== "https:") {
    throw new Error("Cloud Run identity audience must use HTTPS");
  }

  const metadataUrl = new URL(METADATA_IDENTITY_ENDPOINT);
  metadataUrl.searchParams.set("audience", audience.origin);
  metadataUrl.searchParams.set("format", "full");

  const response = await fetch(metadataUrl, {
    method: "GET",
    headers: {
      "Metadata-Flavor": "Google",
    },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(3_000),
  });

  if (!response.ok) {
    throw new Error(`Cloud Run identity token request failed with status ${response.status}`);
  }

  const token = (await response.text()).trim();
  if (token.split(".").length !== 3 || token.length < 100) {
    throw new Error("Cloud Run identity metadata returned an invalid token shape");
  }

  return token;
}
