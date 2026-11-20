# YC-45 / Witnessed Synthetic Checkpoint Contract

Status: **CANDIDATE — synthetic research; no production authority**  
Date: 2026-11-20 · Compatibility: YC-41 through YC-44

## Scope and non-goals

This wire contract binds a synthetic issuer-registry state to a monotonic event-history position, a predecessor checkpoint, one operator signature, and an independently pinned witness quorum.

It is **not** a W3C Verifiable Credential, RFC 9162 Certificate Transparency Merkle tree, C2SP checkpoint implementation, public trust registry, legal-business certificate, or a deployed log service. Public identity assurance, marketplace publication and agent actions remain prohibited.

## Wire objects

The JSON Schema 2020-12 contract is at `schemas/issuer/checkpoint.synthetic.schema.json`. It describes:

- `version = yc-checkpoint/0.1.0`; exact synthetic BG issuer-registry `origin`.
- `sequence` — last lifecycle-event position, positive monotonic integer.
- `event_head_hash` — head of YC-44's existing replayable lifecycle event chain.
- `state_hash` — SHA-256 of the deterministically serialized replayed state.
- `previous_checkpoint_digest` — `GENESIS` or digest of the predecessor's core.
- `issued_at` — bounded freshness/clock timestamp.
- `log_signature_b64url` — Ed25519 signature by the pinned log operator key.
- `witness_signatures[]` — Ed25519 approvals by independently pinned witness keys.

**Wire shape is not verification.** JSON Schema cannot prove signature validity, history completeness, witness independence or replay consistency. A schema-valid object is not a verified checkpoint.

## Deterministic binding

Let (H) denote SHA-256 of a UTF-8 JSON tuple with explicit domain separator. The prototype uses:

```text
state_hash     = H(["YC45-STATE-0.1", deterministicRegistryStateFields...])
checkpoint_id  = H(["YC45-CHECKPOINT-DIGEST-0.1", version, origin,
                    sequence, event_head_hash, state_hash,
                    previous_checkpoint_digest, issued_at])
signing_bytes  = UTF8(JSON(["YC45-CHECKPOINT-SIGN-v0.1", signer_id, checkpoint_id]))
```

The exact operational byte encoding belongs to implementation version 0.1. Replacing this with canonical JSON or Merkle receipts requires explicit protocol versioning, migration fixtures, and cross-language vectors.

## Independent verification rules

A verifier MUST fail closed unless all are satisfied:

1. Exact synthetic origin, version and field format; nonzero safe integer sequence.
2. Timestamp in the permitted freshness window, no future checkpoint; checkpoint sequence strictly advances past previous, if present.
3. Predecessor core digest matches and its time does not exceed the newer checkpoint time.
4. A trusted, **out-of-band pinned** Ed25519 operator public key validates the operator signature.
5. At least two distinct pinned and active witnesses validate distinct signed witness IDs; no witness ID or public key duplication; no witness public key equal to the operator's.
6. Full YC-44 history replays without event or authorization error and reproduces current sequence, head, and state digest.
7. A prior checkpoint, when provided, is reproducible by replaying the exact prefix and matching prior sequence, head and state.
8. Verification never promotes `public_claim_allowed` or `agent_action_allowed` above `false`.

A quorum of witnesses tied to a single operator is not independence. Real witness governance, key custody, auditability, revocation, and anti-equivocation gossip are **not** solved by this PoC.

## Threat model and limitations

| Threat | Prototype response | Residual exposure |
| --- | --- | --- |
| Edited event in provided history | Existing YC-44 hash chain and replay reject | History can be omitted from a dishonest source |
| Rollback or substituted parent | Monotonic sequence and pinned predecessor digest | First-use trust and client checkpoint retention needed |
| Malicious full-history rewrite | Prior witnessed prefix must match | Full replay is O(n); no succinct inclusion/consistency proofs |
| Duplicate witness identity or underlying key | Reject configuration or proof | Independent organizational control not cryptographically knowable |
| Compromised operator alone | Witness quorum requirement | Colluding witness quorum can sign an invalid fork |
| Key rotation / emergency revocation | Out of scope | No production witness registry or secure key-management workflow |
| Liveness failure | Fail closed | No quorum-availability guarantee |

The integrity model depends on the verifier already possessing the authenticated pinned trust configuration **and** authenticated prior checkpoint. A purely freshly signed checkpoint without a retained predecessor does not establish historical consistency or public trust.

## Protocol alignment path

Research references: [RFC 9162](https://www.rfc-editor.org/rfc/rfc9162.html) for Merkle inclusion/consistency; [C2SP checkpoint](https://github.com/C2SP/C2SP/blob/main/tlog-checkpoint.md) and [witness](https://github.com/C2SP/C2SP/blob/main/tlog-witness.md) formatting; [Sigstore Rekor](https://docs.sigstore.dev/logging/overview/) for deployed transparency design. This PoC **does not claim conformity** to any of them.

**YC-46 candidate** (not authorized for production): define a versioned authenticated checkpoint-retention and witness-key-rotation protocol; benchmark full replay; only then select interoperable Merkle proof or other distributed-trust mechanism.

## Acceptance gates

- Public protocol schema + malformed/overclaim fixtures: testable.
- Runtime positive and adversarial replay/quorum tests: required.
- Green CI on both draft, stacked branches: required.
- Independent custody, operational service, persistent canonical log, public certificates: **HOLD**.
