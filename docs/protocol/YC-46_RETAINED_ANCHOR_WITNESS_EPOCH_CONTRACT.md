# YC-46 / Retained Checkpoint and Witness-Trust Epoch Contract

Status: **CANDIDATE — synthetic protocol; no production issuance or release**  
Date: 2026-11-20 · Inherits YC-41–YC-45 without authority escalation

## Problem

A freshly signed checkpoint cannot independently prove historical continuity, even with two witness signatures, if the verifier has no authenticated prior state. YC-46 makes the predecessor a retained verifier-side state and makes witness-key rotation an explicit two-sided transition.

## Objects and dependency

```text
Offline out-of-band pin (anchor digest + trust epoch digest)
  └─ bootstrap → RetainedVerifierState(revision=0)
       ├─ advance(checkpoint, full history, expected revision)
       │    → prior-prefix replay + YC-45 witness quorum → revision+1
       └─ rotate(next epoch, transition proof, expected revision)
            → old quorum + new quorum + fresh key → revision+1
```

The runtime uses these synthetic application-level types:

- `TrustEpoch(epoch, previous_epoch_digest, trust)`: numbered witness set and required quorum, with pinned Ed25519 SPKI keys and fixed operator key.
- `OfflineBootstrapPin(origin, anchor_digest, trust_epoch_digest, authorization_ref)`: explicitly supplied out-of-band reference, not an online claim, and not automatically verified to a legal authority.
- `RetainedVerifierState(revision, anchor, anchor_digest, epoch, epoch_digest)`: immutable logical state for CAS persistence; public and agent capability flags are always false.
- `SignedTransition`: `yc-trust-transition/0.1.0` core binding source and destination epoch digests to the exact retained anchor digest and time; signed by independent old and new quorums.

JSON Schema: `schemas/issuer/trust-transition.synthetic.schema.json`. This schema enforces shape only, never cryptographic truth.

## Required invariants

1. **No trust on first use.** Bootstrap requires a matching independently provided checkpoint digest and trust-epoch digest plus an explicit synthetic approval reference. A forged caller-supplied pin is still possible without real authenticated distribution; this is a research boundary.
2. **No lost predecessor.** Progression requires the currently retained checkpoint as `previous` and full replay of the exact YC-44 event-history prefix as in YC-45.
3. **No stale writer.** Every update supplies `expected_revision`; mismatches reject. Production storage must apply compare-and-swap atomically with durable persistence.
4. **No hidden witness set mutation.** Trust-epoch digest binds epoch number, predecessor epoch digest, operator key, quorum threshold, and each witness ID + normalized Ed25519 public-key fingerprint.
5. **No unilateral rotation.** Witness rotation requires separately domain-separated, valid old-quorum and new-quorum signatures over a transition bound to the latest retained checkpoint.
6. **At least one fresh co-signing key.** The new epoch must introduce a new public key, and at least one newly introduced key must join the new-quorum approval. Merely relabeling old keys is not rotation.
7. **No operator key rotation as an accidental side effect.** Operator public key must remain byte-identical. Operator rotation requires a separate ceremony/protocol.
8. **No downstream authority promotion.** `public_claim_allowed = false` and `agent_action_allowed = false` regardless of proof success.

Signature payloads: domain-separated JSON tuples `YC46-TRUST-TRANSITION-SIGN-0.1` and `YC46-TRUST-TRANSITION-0.1`, including signer side (`old` vs `new`) and witness ID. Other runtimes must prove byte-level parity before interoperability claims.

## Adversarial tests

- Forged or absent offline bootstrap authority; mismatched pin.
- Conflicting CAS revision and rollback/non-advancing checkpoint.
- Tampered retained anchor and truncated/divergent history.
- Transition bound to a different anchor, epoch or operator.
- Missing old quorum or new quorum; invalid signature.
- New quorum signed only by shared old keys; no fresh signer.
- Malformed trust predecessor; stale or future transition.
- Cross-epoch old-key checkpoint incorrectly accepted under the new witness trust set.

## Residual risks and exclusions

An in-memory immutable reducer is not a durable replicated ledger. The prototype neither authenticates human approvals nor protects against malicious direct modification of the retaining store. A CAS operation in an application process does not guarantee atomic behavior across server instances; database transaction/conditional writes are a subsequent gate.

No independent witness organization, key-management procedure, public audit feed, witness-key revocation, compromised-quorum recovery, append-only Merkle proof, equivocation gossip, or historical rekey replay exists.

References: [RFC 9162](https://www.rfc-editor.org/rfc/rfc9162.html), [C2SP witness protocol](https://c2sp.org/tlog-witness), [C2SP trust policy](https://c2sp.org/tlog-policy). YC-46 is **not conformant** to these protocols; its full-history replay and ad hoc Ed25519 transition are explicitly provisional.

## Acceptance and next gate

- Protocol JSON Schema and negative cases pass CI.
- Implementation positive transition and adversarial cases pass CI.
- Existing YC-39/40 recovery drills remain green.
- Two stacked draft PRs remain unmerged.
- Next bounded target: transactional persistent storage with authenticated offline pin provisioning, distinct-witness governance and split-view/anti-equivocation evidence. No production release without separate review and authorization.
