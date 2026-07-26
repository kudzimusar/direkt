#!/usr/bin/env python3
"""Run the verified RC7 correction while leaving workflow files for connector writes."""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

SCRIPT = Path(__file__).with_name("apply-budget-attestation-correction.py")
spec = spec_from_file_location("rc7_budget_attestation_correction", SCRIPT)
if spec is None or spec.loader is None:
    raise SystemExit("Could not load RC7 budget attestation correction.")
module = module_from_spec(spec)
spec.loader.exec_module(module)

original_replace = module.replace
original_write_text = Path.write_text
original_unlink = Path.unlink


def guarded_replace(path: str, old: str, new: str, *, count: int = 1) -> None:
    if path.startswith(".github/workflows/"):
        return
    original_replace(path, old, new, count=count)


def guarded_write_text(self: Path, data: str, *args: object, **kwargs: object) -> int:
    if self.as_posix() == ".github/workflows/rc7-maps-contract.yml":
        return len(data)
    return original_write_text(self, data, *args, **kwargs)


def guarded_unlink(self: Path, *args: object, **kwargs: object) -> None:
    if self.as_posix().startswith(".github/workflows/"):
        return
    original_unlink(self, *args, **kwargs)


module.replace = guarded_replace
Path.write_text = guarded_write_text
Path.unlink = guarded_unlink
try:
    module.main()
finally:
    Path.write_text = original_write_text
    Path.unlink = original_unlink

Path("scripts/rc7/apply-budget-attestation-nonworkflow.py").unlink()
