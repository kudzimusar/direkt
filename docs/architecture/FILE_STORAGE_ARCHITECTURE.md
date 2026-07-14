# DIREKT File Storage Architecture

## Classes

1. Public provider media.
2. Private verification evidence.
3. Private complaint/incident attachments.
4. Generated receipts/exports.
5. Temporary uploads.

Each class has separate bucket/prefix, access and retention rules.

## Evidence lifecycle

1. API authorizes upload with expected MIME, size and purpose.
2. Client uploads to private temporary path.
3. Backend finalizes using checksum and ownership.
4. File is scanned/validated.
5. Immutable evidence version is created.
6. Reviewer receives short-lived view authorization.
7. Access is audited.
8. Retention/hold/deletion policy applies.

## Controls

- private by default;
- random object keys;
- no user filename as key;
- MIME signature validation;
- size/page limits;
- malware/scanning service where available;
- image metadata stripping where appropriate;
- server-generated public derivatives only for public media;
- encryption at rest/in transit;
- no permanent public evidence URLs;
- lifecycle cleanup for abandoned uploads.

## Public media

Moderated portfolio/premises marketing images are distinct from verification evidence. Publishing a derivative never exposes the original evidence object.

## Backups

Database backup must preserve references and storage backup/versioning strategy must be compatible. Restore tests verify both metadata and object availability.
