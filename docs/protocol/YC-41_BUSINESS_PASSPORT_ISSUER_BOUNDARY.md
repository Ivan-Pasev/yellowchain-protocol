# YC-41 — Business Passport and issuer boundary

**Status:** candidate protocol v0.1.0, synthetic contract slice; not approved certification, national accreditation, operational PKI, or live public issuance.

## Layer separation

1. **Entity:** a stable, opaque YellowChain business identifier points to a legal entity. Establishment, brand, website, representative, and national projection are distinct relations; name similarity never merges entities.
2. **Evidence:** independently sourced records with collection time, lawful-purpose and publication-rights lineage. A URI is not proof of truth.
3. **Review:** competent reviewer decision, appeal, reason and event remain internal until a separate publication authority explicitly admits a public claim (YC-29 through YC-32).
4. **Passport projection:** consent-authorized, jurisdiction- and language-specific public fields; public correction and dispute mechanisms; no private BYOC documents.
5. **Assurance:** independent, cryptographically verifiable, narrowly scoped credential with issuer identity, policy version, status, expiry, revocation and correction route. A payment is not a trust decision.
6. **Capability:** separate, revocable action grant for agent execution or transaction operations. A certificate cannot authorize an action by itself.

## Assurance vocabulary (candidate product terms, **not** accredited certification)

| Code | Meaning | Mandatory gate |
| --- | --- | --- |
| YC-0 | Indexed record; **not a credential** | provenance and correction route; never imply verification |
| YC-1 | Claimed profile-control attestation | authority over profile + scoped review + active publication |
| YC-2 | Legal-entity/representative identity assurance | independently checked evidence, issuer competence, subject match |
| YC-3 | Assertion-specific attestation | claim-specific evidence and competent issuer |
| YC-4 | Named-criteria assessment | published criteria/version, independent evaluator and appeal |
| YC-A | Agent-action grant, **not a certificate tier** | authenticated owner, consent, scope, expiry, revocation |
| YC-T | Transaction grant, **not a certificate tier** | explicit mandate, risk control, confirmation and audit |

YC-1 through YC-4 are not a cumulative quality score. YC-2 does not imply endorsement of goods, services or ethics. YC-4 does not claim statutory accreditation unless separately obtained and correctly scoped. The word "verified" must always say *what*, *by whom*, *when*, *to which standard*, and *until when*.

## Machine contract

`schemas/passport/business-passport-public.schema.json` is a JSON Schema Draft 2020-12 **candidate**, with a valid Bulgarian synthetic example and an intentionally rejected overclaim fixture. A synthetic passport is always a preview with empty assurance and agent-capability arrays, even if untrusted upstream fields say `verified`.

The schema validates shape, **not** whether a legal fact is true, signatures are valid, publication rights exist, an issuer is authorized, a credential is current, or an action grant is consented. Those require independent policy and runtime verifiers. `publication.status=published` additionally requires authority-event and rights references, but a validator must validate those references against the governed N-BIL chain and current authorization state.

## Ontology crosswalk policy

Maintain entity-type separation and reversible, effective-dated mappings to Schema.org `Organization`, `LocalBusiness`, `Product`, and `Service`; NACE Rev. 2.1 economic activity; CPA 2.2 products by activity; GS1 GPC product classes. No automatic one-to-one crosswalk between taxonomic systems. Each mapping must carry source edition, mapping type (`exact`, `narrow`, `broad`, `related`), confidence, reviewer, effective date, replacement history, and tested rollback.

**Sovereignty:** countries control their legal-evidence/purpose rules; global identifiers are portable; national projections cannot change the legal subject. Provider-driven storage is not the trust anchor.

## Fail-closed issuer lifecycle

`candidate -> evidence_checked -> decision_approved -> publication_authorized -> signed -> active -> expired/revoked/superseded`.

No step is inferred from the next. Failed evidence, invalid issuance authority, expired rights, missing consent, appeal hold, conflicting subject, key compromise or missing revocation lookup blocks issuance/public display. Every state transition requires audit and correction paths. Issuer registry, key ceremony, policy body, independent review and public status service must exist before YC-1 or above is exposed as a live product.

## Threat tests

- Synthetic, imported or paid listing attempts to promote itself to YC-2: **reject**.
- A merchant proves domain control but not legal-representative authority: **no YC-2**.
- A valid credential signs an outdated or false claim: cryptography alone **does not establish truth**.
- A revoked credential is cached: verifier must obtain sufficiently fresh status or **fail closed** on consequential use.
- A merchant connects Drive/Cloudflare: this gives scoped data access, **not** legal-entity or agent-action authority.
- A global AI app requests checkout capability from a read-only passport: **deny**.
- An organization buys a higher SLA: service priority **does not alter assurance outcome**.

## Release gates

This increment is admissible only for local synthetic reads and schema/contract tests. The following are **HOLD**: real Yellow Pages ingestion, production certificate issuance, third-party reliance claims, billing, outbound campaigns, agent mutations, irreversible DNS, and national replication. Reconcile issuer-policy jurisdiction, Bulgarian legal review, credential interoperability (W3C VC), data rights, key custody, revocation/appeals, CI validation and observed unit economics before any activation.
