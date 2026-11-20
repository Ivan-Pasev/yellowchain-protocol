# YC-44 — Synthetic Issuer Registry and Credential Lifecycle

Status: **CANDIDATE implementation**, with machine-readable event shape and adversarial replay tests. No real issuer registry, W3C VC status service or public certificate issuance.

## Registry boundary

An issuer and a credential have separate state machines. Both are reconstructed from a sequential, append-only event list. The reducer does not trust actor-declared roles: it consults a caller-supplied, externally trusted synthetic authority grant table. That table is a dependency to be authenticated and governed in the future.

| Subject | Admissible transitions | Terminal |
| --- | --- | --- |
| Issuer | absent → pending → active → suspended → active; suspended → rotate key → active | revoked |
| Credential | absent → registered → active → suspended → active | revoked |

- Issuer registration and activation are **registry governor** actions.
- Issuer suspension and key rotation are **security custodian** actions.
- Credential registration is a **registry governor** action; it admits a synthetic reference, **not** a real issued credential.
- Credential activation, suspension, reinstatement and revocation are **credential status officer** actions.
- Key rotation requires prior suspension and a different SHA-256 fingerprint. Reinstatement is separate.
- Credential activation/reinstatement requires an active issuer. Revoke may proceed even when the issuer is suspended.
- Revoked issuer or credential cannot be restored by ordinary event replay. A new identity/key decision would need an independent governance protocol.

## Event contract

`schemas/issuer/lifecycle-event.synthetic.schema.json` describes event fields, role/action relationships, key-fingerprint placement, evidence references, sequential index, prior event hash and digest. The implementation independently checks a deterministic SHA-256 hash of a fixed ordered tuple and rejects gaps, replayed IDs, timestamp reversals, future events, untrusted grants, invalid state transitions or tampering.

Important boundary: a hash chain is tamper-evident **only relative to a separately witnessed checkpoint**. It does not by itself authenticate human authority, establish source truth, make log inclusion globally final, or prevent complete replacement of an unwitnessed history. Signed independent checkpoints and key custody are deferred.

## Relationship to YC-43

YC-43 cryptographically verifies a synthetic assurance and issuer-signed status. YC-44 reconstructs **internal synthetic lifecycle state**. They are not yet wired into a production trust registry, and lifecycle `active` must not substitute for a valid signed status receipt. Key rotation history and backward verification of pre-rotation credentials require a versioned key registry with effective intervals; this is the next dependency.

`SignatureValid ≠ StatusCurrent ≠ IssuerAuthorized ≠ ClaimTrue ≠ PublicationAuthorized ≠ AgentCapability`.

## Adversarial obligations

- Duplicate event ID, skipped sequence, mismatched prior hash, altered digest.
- Self-declared authority or wrong authority role.
- Missing/duplicate evidence, invalid policy reference or future timestamp.
- Unauthorized key rotation or key payload in unrelated event.
- Credential activation while issuer is pending/suspended/revoked.
- Terminal revoked-to-active attempt, credential issuer mismatch.
- Partial replay of untrusted history before an independently witnessed checkpoint.

## Release gates

The YC-44 code is synthetic-only and read-only. **HOLD:** production issuer registration; certificate signing or issuance; external trust-list publication; partner data import; public verified claims; merchant actions; payments; Cloudflare mutations; customer SLA assurance or accreditation assertions.

Before a release: verify independent grants, dual-control policy, signed event checkpoints, durable transaction/idempotency semantics, key custody and rotation history, W3C VC status profile, appeals, legal policy and external adversarial review.
