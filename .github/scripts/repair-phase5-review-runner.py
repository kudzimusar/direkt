from pathlib import Path

path = Path('.github/scripts/apply-phase5-review-fixes.py')
text = path.read_text()
text = text.replace(
    '    3,\n    "existing public query eligibility predicates",',
    '    4,\n    "existing public query eligibility predicates",',
    1,
)
text = text.replace(
    '    "          AND organizations.status = \'ready_for_verification\'",\n'
    '    "       FROM account.saved_public_providers AS saved\\n"',
    '    "          AND organizations.status = \'ready_for_verification\'\\n"\n'
    '    "          AND category_selections.status = \'selected\'",\n'
    '    "       FROM account.saved_public_providers AS saved\\n"',
    1,
)
text = text.replace(
    'Path("backend/direkt-api/test/e2e/discovery.e2e-spec.ts")',
    'Path("backend/direkt-api/test/e2e/discovery.e2e.spec.ts")',
    1,
)
if '    4,\n    "existing public query eligibility predicates",' not in text:
    raise RuntimeError('Eligibility predicate matcher repair was not applied.')
if (
    '"          AND organizations.status = \'ready_for_verification\'\\n"\n'
    '    "          AND category_selections.status = \'selected\'",'
    not in text
):
    raise RuntimeError('Saved-provider matcher repair was not applied.')
if 'Path("backend/direkt-api/test/e2e/discovery.e2e.spec.ts")' not in text:
    raise RuntimeError('Collected discovery test path repair was not applied.')
path.write_text(text)
