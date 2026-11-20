# YC-47 / Transactional Synthetic Trust Retention and Split-View Evidence

Status: **CANDIDATE — synthetic engineering, no production certificate authority**  
Date: 2026-11-20 · Inherits YC-41 through YC-46

## Executive contract

YC-47 separates the YC-46 pure retention reducer from an actual PostgreSQL transaction boundary. A single synthetic origin retains exactly one checkpoint/epoch/revision state. Every approved state change and its acceptance journal are committed together. Concurrent requests with the same expected revision must produce at most one accepted advance.

YC-47 also produces a separately stored observation when **two cryptographically verified checkpoints, each replayed from the same pinned predecessor, claim the same sequence but contain different history heads**. This is evidence of a synthetic conflicting-view condition, not an externally validated transparency-log proof.

## Persistence invariants

1. **No implicit bootstrap:** a `yc47_verifier_states` row is inserted only if YC-46 offline pin checks succeed; a second bootstrap cannot overwrite it.
2. **Atomic acceptance:** `BEGIN` → `SELECT … FOR UPDATE` on the origin row → YC-46 deterministic reduction → guarded `UPDATE WHERE revision = expected` → append acceptance event → `COMMIT`. A failure rolls the transaction back.
3. **No two winners:** two different pools may race, but only one candidate can commit for revision `r+1`. The loser observes `YC47_CAS_CONFLICT` after the row lock releases.
4. **Restart continuity:** a fresh process loading PostgreSQL must recover the accepted anchor and epoch digest; uncommitted or rolled-back updates must disappear.
5. **Corruption checks:** a loaded state must match database revision, anchor digest and trust-epoch digest, with public/agent authorities false. Hash agreement is integrity checking, not protection against a malicious privileged database administrator.
6. **Evidence append:** an accepted state revision has an associated journal row; split-view observations use a separate deduplicated table and do not change accepted state or revision.
7. **Synthetic-only scope:** origin, witness IDs, trust epoch and signed fixtures cannot be promoted to real business issuance, publication or agent action.

## Conflicting views

For signed checkpoints (A) and (B), common retained predecessor (P), pinned trust set (T), and supplied replayable histories:

```text
verify(A, P, history_A, T) = valid
verify(B, P, history_B, T) = valid
sequence(A) = sequence(B) > sequence(P)
head(A) != head(B) or state(A) != state(B)
→ YC47_SYNTHETIC_CONFLICTING_VERIFIED_VIEWS
```

The canonical record sorts checkpoint digests, retains both signed candidate checkpoints and replay input histories, and stores a deduplicated observation. JSON Schema 2020-12: `schemas/issuer/split-view.synthetic.schema.json`.

It is not sufficient to observe two arbitrary JSON objects, two unverified signatures, two timestamps, or a signed checkpoint without the pinned predecessor. Detection of a conflict is not remediation or independent notarization. Public monitoring, gossip and evidence lifecycle governance remain absent.

## Adversarial acceptance tests

- Two independent PostgreSQL pools concurrently submit distinct, otherwise-valid checkpoint advances from revision 0; exactly one commits.
- Second bootstrap fails after valid first bootstrap.
- Bad offline pin fails without inserting a row.
- Competing signed/replay-valid views generate exactly one canonical fork observation even when submitted in reversed order.
- A signature-tampered view cannot generate a verified conflict observation.
- After a successful advance, old-sequence pairs are no longer comparable against the current retained anchor.
- Explicitly rolled-back database writes do not survive a new process and new database connection.
- Acceptance journal and fork evidence counts survive restart.
- No public certificate or agent action is enabled.

## Limits and deployment gates

This is a research database client and fixture-backed CI, not an audited online witness. Transactional guarantees apply to the single PostgreSQL database used by the test and must not be extrapolated to multi-region replication, failover, asynchronous replicas, backups or externally governed trust anchors. Privileged database tampering, key compromise and history custody are separate threats.

Sensitive production business data must not be copied into the synthetic `evidence_json` structure. A future privacy/supply-chain policy must define minimization, retention, redaction and export. No W3C VC, C2SP, RFC 9162, BBB-equivalent accreditation or YCF legal certification claim is created by this module.

Technical anchors: [PostgreSQL row-level locking](https://www.postgresql.org/docs/current/explicit-locking.html), [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [C2SP witness protocol](https://c2sp.org/tlog-witness).

## NEXT gate

YC-48 candidate: authenticated offline pin provisioning and auditably independent witness custody; transactional failover/replica recovery; cross-observer gossip and forward-secure evidence publication. Production certification remains HOLD.
