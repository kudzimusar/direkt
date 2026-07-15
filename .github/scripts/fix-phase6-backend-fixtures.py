from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one match, found {count}")
    file_path.write_text(text.replace(old, new, 1))


replace_once(
    "backend/direkt-api/test/e2e/provider-workspace-uploads.e2e.spec.ts",
    """    provider = await createProvider(owner, 'Synthetic Recoverable Uploads');
    otherProvider = await createProvider(otherOwner, 'Synthetic Other Upload Workspace');

    const contract = await pool.query<{""",
    """    provider = await createProvider(owner, 'Synthetic Recoverable Uploads');
    otherProvider = await createProvider(otherOwner, 'Synthetic Other Upload Workspace');

    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'ready_for_verification',
        reason: 'Synthetic provider is ready for recoverable upload verification',
      })
      .expect(201);

    const contract = await pool.query<{""",
    "recoverable upload provider lifecycle",
)

workspace_path = Path("backend/direkt-api/test/e2e/provider-workspace.e2e.spec.ts")
workspace = workspace_path.read_text()
for field in ("privateRationale", "objectKey"):
    old = f"expect(serialized).not.toContain('{field}');"
    new = f"expect(serialized).not.toContain('\"{field}\":');"
    count = workspace.count(old)
    if count != 1:
        raise RuntimeError(
            f"provider timeline private-field assertion {field}: expected one match, found {count}"
        )
    workspace = workspace.replace(old, new, 1)
workspace_path.write_text(workspace)
