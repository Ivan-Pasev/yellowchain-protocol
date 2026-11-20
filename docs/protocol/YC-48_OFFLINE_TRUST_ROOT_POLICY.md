# YC-48 / Offline Trust-Root Policy and Witness Governance Boundary

Status: **CANDIDATE — synthetic verifier and schema, no operationally independent trust authority**
Date: 2026-11-20 · Dependency: YC-41 through YC-47

## Decision

A cryptographically valid checkpoint is only as trustworthy as the verifier's authenticated root policy. YC-48 binds a named synthetic log origin, checkpoint anchor digest, witness epoch digest, root key set and threshold, and witness-to-operator claims into a versioned offline-pinned policy envelope. The verifier must never accept the first policy it happens to download as its trust root.

**Bootstrap:** an offline-authorized pin contains the exact manifest digest, independently pinned key fingerprints and threshold, all matching a signed version-1 policy with two or more root-key signatures. A self-signed policy delivered over HTTPS, a Google Drive attachment, a Cloudflare Worker, a DNS record, or a public GitHub page is not by itself an authenticated trust bootstrap.

**Rotation:** from a retained accepted policy, the next version MUST be strictly +1, link the previous policy digest, bind the selected retained checkpoint/epoch and pass the current-root threshold AND the candidate-root threshold, using domain-separated Ed25519 signatures. A newly introduced root key must participate in the new quorum. A stale expected revision, expired root, invalid signature, malicious new-only root or tampered policy fails closed. Root-threshold compromise or expiry cannot be repaired by an automatic online self-approval; recovery requires an external trusted ceremony.

## Minimal portable objects

- `offline-root-pin.synthetic.schema.json`: out-of-band pin carrier shape (not proof of who authorized it).
- `offline-trust-policy.synthetic.schema.json`: policy envelope, root keys, source witness/operator claims, chain and signatures.
- `@yellowchain/issuer/root-policy`: Ed25519 verification, domain-separated digest/signature bytes, bootstrapping and monotonic update reducer.
- Governance claims: `witness_id`, `operator_id`, `custody_evidence_ref`, fixed status `self-declared-unverified`. The verifier checks unique declared operator IDs and exact witness-roster coverage, but DOES NOT establish the truth of those IDs or custody claims.

The policy uses deterministic JSON array hashing of fixed fields and key SPKI fingerprints. This is an application-specific experimental serialization. It is **not** a TUF implementation, C2SP trust-policy parser, SCITT receipt, RFC 9162 consistency proof or W3C VC credential.

## Formal invariants

1. `admit(bootstrap)` iff the core is structurally/time valid, exact pinned manifest digest and pinned root set match, offline authorization reference is syntactically present and the pre-pinned root signature threshold verifies. The reference alone does not prove authorization.
2. `admit(candidate | current)` requires coherent retained policy digest, expected revision equality, `candidate.version = current.version + 1`, a predecessor digest equality, unexpired old root, and both old and new signing thresholds.
3. Root-key freshness is constrained: if new public key material appears, at least one actually newly introduced key must sign the new-policy side.
4. All candidate policies bind the specific YC-46/47 retained checkpoint and witness epoch digests supplied to the verifier. Trust policy and checkpoint may progress on distinct schedules; the application must bind policy changes to its authoritative retained state.
5. Distinct key fingerprints prove distinct public keys, **not** distinct human organizations, hardware custody, jurisdictional independence, or legal accreditation.
6. `public_claim_allowed=false` and `agent_action_allowed=false` are immutable. None of the YC-48 artifacts authorizes a public YellowChain business certificate or agentic commerce action.
7. Validity expiration and pinned-policy rollback checks require a trustworthy clock and tamper-resistant retention in a later deployment. YC-48's root-policy reducer is in-memory; YC-47 transactional PostgreSQL storage is not yet extended to root policy.

## Threat and evidence matrix

| Scenario | Mechanical response | Still unproven |
| --- | --- | --- |
| Malicious replacement root at first download | Exact external pin required, signatures checked | Who attested and distributed pin |
| Forged new-key-only rotation | Old-root quorum required | Offline key custody |
| Stale policy replay after new version | Revision + previous digest checked against supplied retained policy | Monotonic, tamper-resistant root-policy persistence |
| Expired root or quorum compromise | Fail closed; external ceremony required | Real recovery operator, authorized emergency rule |
| Same operator behind multiple witness keys | Duplicate declared operator IDs rejected | Independent legal/control identity verification |
| Compromised log gives distinct views | YC-47 split-view evidence, separate protocol | Public gossip, monitors, honest publication witnesses |
| Root policy delivered by a cloud provider | Payload verification independent of carrier | Authenticated original offline root provisioning |
| Cross-country node policy | Origin pin isolates synthetic BG registry | Real sovereign delegation and national-law review |

## Adversarial acceptance bar

- Valid offline-pinned policy admits one local synthetic state.
- Pin substitution, wrong fingerprint, undersigned bootstrap, forged signature, duplicate operator, wrong epoch and expired/unbounded policy fail.
- Proper old/new quorum and newly introduced root signer admit one version advance.
- Self-signed malicious replacement, root downgrade, missed prior version, stale CAS revision, old policy expiry and retained policy corruption fail.
- Protocol JSON Schemas reject publication/agent overclaim and elevated independence status.
- No production DNS, real witnesses, live credentials, merchant data, issuance or external key ceremonies.

## Architecture alternatives and standards

The Update Framework (TUF) distinguishes offline Root metadata and online roles, root signature thresholds and compromise recovery. C2SP tlog-policy models log and witness keys plus quorum; its witness protocol verifies continuity over checkpoints. RFC 9943 (SCITT) distinguishes signed assertions from transparent registered statements, and does not convert an issuer's signature into the truth of its assertion. YC-48 borrows explicit trust-boundary ideas but cannot claim conformance to any of these specifications without format/protocol-level interoperability testing.

References:
- https://theupdateframework.io/docs/metadata/
- https://theupdateframework.io/docs/faq/
- https://c2sp.org/tlog-policy
- https://c2sp.org/tlog-witness
- https://www.rfc-editor.org/rfc/rfc9943.html

## Production / Foundation gates (HOLD)

- A legally accountable YCF root authority and public trust-policy publication rule.
- Independent witness organizations audited under an approved custody and conflict-of-interest policy.
- Hardware-backed root custody, owner quorum separation and documented loss/compromise recovery.
- Independent offline root distribution channel, independently checked witnesses and monitors.
- Durable, anti-rollback root-policy retention with cross-replica restore and safety metrics.
- Certificate policy: scoped assurance levels, independent validation and revocation/dispute appeals.
- Jurisdiction-specific governance and privacy reviews before national nodes or public certificate claims.

## NEXT()

YC-49 candidate: transactional root-policy persistence coupled to YC-47's checkpoint retention with cross-observer recovery/gossip audit bundles; alternatively shift delivery capacity to the Bulgarian Business Passport/GEO pilot while keeping external trust-operator onboarding as an explicit HOLD gate.
