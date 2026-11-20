# YC-43 — Synthetic issuer policy and revocation verifier

**State:** candidate protocol/implementation verification exercise. Not a W3C Verifiable Credential implementation, accredited certificate, legal identity proof, live issuer registry, DNS authentication, or production trust service.

## Purpose and chain of authority

The public Business Passport (YC-41) is an identity projection. This verifier concerns an independent claim-specific assurance envelope, with all dependencies provided by separate trusted channels.

1. The verifier receives an **externally trusted issuer authority record**. An envelope must not supply its own trusted root.
2. The issuer record contains jurisdiction, allowed assurance tiers, exact allowed claim scopes, policy version, effective period, status, public key and a synthetic trust-registry event reference.
3. An assurance envelope binds subject, claim scope, evidence reference list, issuer, policy version, issuance and expiry using Ed25519.
4. An **independently signed status receipt** binds credential, issuer, active/revoked/suspended state, observation time and freshness deadline.
5. Acceptance requires unexpired authority, exact jurisdiction and subject, scope allowance, valid signature, valid temporal order, a fresh validly signed active status and non-empty evidence references.

The output reports only synthetic cryptographic binding and current policy/status admissibility. It always returns `public_claim_allowed=false` and `agent_action_allowed=false`. An independent YC-29–32 publication decision and capability grant would still be required.

## Wire contracts

- `schemas/issuer/issuer-authority.synthetic.schema.json`
- `schemas/issuer/assurance-envelope.synthetic.schema.json`
- `schemas/issuer/status-receipt.synthetic.schema.json`

JSON Schema checks surface shape, not the issuer's true competence or the provenance of the issuer allowlist. The implementation uses an explicit ordered, domain-separated tuple for synthetic signature test vectors only. It is **not** RFC 8785 JSON canonicalization or W3C VC Data Integrity. No private keys are stored: local tests generate disposable Ed25519 keys at execution time.

## Required counterexamples

| Failure | Expected verifier decision |
| --- | --- |
| Unknown or inactive issuer | Deny |
| Issuer key substituted | Deny |
| Subject or policy version mismatch | Deny |
| Tier or claim scope outside authority | Deny |
| Missing or duplicated evidence reference | Deny |
| Expired assurance or authority | Deny |
| Forged or mismatched status signature | Deny |
| Revoked or suspended credential | Deny |
| Stale, future-dated or expired status | Deny |
| Valid synthetic assurance requesting public publication or agent action | **Still deny public/action authority** |

## Invariants and next proof obligations

- `SignatureValid \not\Rightarrow ClaimTrue`.
- `PolicyPermitted \not\Rightarrow PublicationAuthorized`.
- `AssuranceValid \not\Rightarrow AgentCapabilityGranted`.
- `PaidSLA \not\Rightarrow IssuerIndependence`.
- `SyntheticTest \not\Rightarrow LiveCredential`.

The next release requires a governance-approved issuer registry, key ceremony and rotation, revocation service and signed checkpoints, independent review/appeals, rights and jurisdiction policies, W3C VC interoperability profile, privacy/security assessment and external relying-party tests.

**HOLD:** any YC-1..4 live issuance, BBB-style accreditation comparisons, production marketing claims, Yellow Pages SQL ingestion, customer OAuth, payouts, agents or transaction execution.
