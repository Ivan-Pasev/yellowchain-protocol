# YC-51 — Synthetic Site Control + Independent Business Authority (Two-Proof Binding)

Status: CANDIDATE · 2026-11-20 · BG synthetic test records only  
Predecessors: YC-41 Business Passport → YC-49 GEO readiness → YC-50 merchant export consent  
Deployment: NONE · Public assurance: NONE · Main-net interactions: NONE

## Constitutional decision

A website-control challenge proves control of a challenged website surface **only when an independent verifier actually observes it**. It does not prove ownership of the registered business. Conversely, a business-document review does not imply authority to publish on, or operate, a particular website. A YellowChain claim may be associated with a business and domain only after two separate, scoped, evidence-bearing proof events.

**This YC-51 increment implements only a synthetic simulator.** All hosts are reserved \`.example\` or \`.test\`; an Ed25519 fixture observer reports a simulated observation, and an independent fixture reviewer reports simulated business authority. Neither role has real-world standing. No DNS query, HTTP fetch, registry search, domain validation, real legal representative review, paid certificate, listing publication or merchant workflow is executed.

## Contract objects

1. \`SyntheticOwnerBindingState\`: challenge ID (UUID), tenant, canonical BG business ID, reserved hostname, SHA-256 secret digest, issue and 10-minute expiry, state/revision and digests of subsequent evidence. No raw secret, domain credentials or legal document bytes are retained.
2. \`SignedSyntheticSiteObservation\`: \`synthetic_fixture_observer\` evidence, precise challenge/tenant/business/hostname/secret digest/time bindings, detached Ed25519 signature. Valid only under a pre-pinned \`synthetic_site_observer\` key.
3. \`SignedSyntheticAuthorityReview\`: evidence-reference list, explicit synthetic review decision, site-observation digest linkage, signed by a separately pinned \`synthetic_business_reviewer\` key. A different public-key fingerprint from the site observer is mandatory.
4. \`SyntheticVerifierPin\`: role, key ID, PEM, SHA-256 SPKI fingerprint, out-of-band authorization reference. The verifier must obtain pins from a separately governed trusted registry; candidate-supplied pins are not self-authenticating.

Schemas: \`schemas/claim/{site-owner-binding,site-observation,business-review}.synthetic.schema.json\`, \`schemas/claim/synthetic-verifier-pin.schema.json\`.

## Deterministic state machine

| From | Input and invariant | To | Revision |
| --- | --- | --- | --- |
| no challenge | Synthetic BG Passport, valid tenant ID and reserved hostname, trusted clock | \`pending\` | 0 |
| \`pending\` | Correct one-time secret digest, still inside 10-minute window, signed fixture observation matching all bindings, pinned site-observer key | \`control_observed_synthetic\` | 1 |
| \`control_observed_synthetic\` | Signed approved fixture review, nonempty evidence refs, same tenant/business/domain/challenge/observation, distinct pinned reviewer key, <=24h review window | \`bound_synthetic_only\` | 2 |

All mutations are functionally pure: rejected input returns no next state. The caller must commit a successful state using **transactional compare-and-swap** and one-time consumption for cross-process replay prevention. YC-51 implements **neither** durable storage nor atomic transaction; \`expected_revision\` is an in-memory guard and does not establish concurrency safety across replicas. Loss, rollback or tampering of externally retained state remains a blocker to real use.

Every stage has immutable \`operator_ownership_verified=false\`, \`public_claim_allowed=false\` and \`agent_action_allowed=false\`. There is no transition to a real ownership or public certification state.

## Proof rules and adversarial controls

- Site and legal business evidence are distinct proof types; same-key reviewer/observer collusion is rejected at the key level (operator independence requires a later governance check).
- Every signature includes domain-separated payload hashing. Reviewer signature binds the earlier observation digest, and no field may be added to bypass the wire contract.
- A challenge expires after exactly 10 minutes. The observer may not claim a future observation; review must be within 24 hours of the observed event.
- No open redirects, URL fetches, internal IPs or wildcard tenant authority: the simulator accepts bare lowercase reserved hostnames only. Future real probe adapters require DNS re-resolution/SSRF/redirect validation and independent authorization.
- Credential integrity is not claim truth. Even a valid reviewer signature is merely a synthetic fixture decision, not corporate registry verification, authorized representative identity or delegated business rights.
- A signed YC-50 export consent and YC-51 simulated site binding are insufficient for public YC assurance, verified listing or agentic service authorization.

## Real-world promotion gate (not met)

1. Owner-claim access controls, legal-entity vs establishment association, entity conflict and appeal/dispute handling.
2. Actual authorized independent DNS TXT or HTTPS file challenge observation; safe networking, ingress controls, private IP and redirect denial, expiry, revalidation and status revocation.
3. Registry-backed documentary review of legal entity and human/delegate authority, source provenance, regional retention/privacy and two-person/role separation.
4. Durable, auditable transactional state with uniqueness of challenge consumption, idempotency, nonce entropy, revocation, rate limits, time source, key custody and witness/audit log.
5. National issuance policies, authoritative operator and SLA governance, independent security/legal review, and separate explicit activation authorization.

Only upon satisfying these may a later protocol define \`website_control_verified\` and \`business_authority_verified\` in production. This document does not do so.

## Checks and next bounded increment

Public schema validator checks allowed stages, non-promotable flags, strict fields and evidence references. Private implementation CI exercises Ed25519 signatures, expiry, cross-tenant/business/host substitution, state transition order, key separation and tampering.

YC-52 proposed: PostgreSQL-backed atomic challenge consumption and status-revision ledger, still synthetic first, before designing a real authorized observer adapter.
