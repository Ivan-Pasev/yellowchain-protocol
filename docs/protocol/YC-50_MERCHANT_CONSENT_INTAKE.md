# YC-50 / Merchant-Authorized Evidence Intake — Provenance & Capability Boundary

Status: **CANDIDATE (synthetic cryptographic fixture only)** · Date: 2026-11-20
Predecessor: YC-49 GEO readiness receipt, YC-41 Business Passport
Deployment: NONE · Pilot target: BG volunteer merchant

## 1. Constitutional decision

A merchant's permission to **submit a website snapshot** is not permission to **crawl their site**, **read their Google Drive**, **read Cloudflare zone settings**, **publish a marketplace storefront**, or **act as a merchant agent**. Every action requires independently scoped, revocable capability evidence.

YC-50's first executable intake operation is precisely `geo.snapshot.submit` with `source_provider=synthetic_merchant_export`. All hosts are reserved `.example` or `.test`. This increment creates no provider OAuth session, cloud API token, crawl, publication action, user account or certificate.

## 2. Minimal typed contract

`SignedSyntheticConsent` includes:
- Stable `yc:business:BG:...` identity, per-grant nonce-like ID and synthetic merchant key ID.
- Specific source hostname; provider exactly `synthetic_merchant_export`.
- Purpose `geo.snapshot.submit`, data class `synthetic_public_business_page`, synthetic consent/evidence references.
- `issued_at`, `expires_at` (<= 30 days), signature over domain-separated digest.
- Immutable `live_crawl_allowed=false`, `cloud_account_access_allowed=false`, `publication_allowed=false`, `public_claim_allowed=false`, `agent_action_allowed=false`.

`SyntheticMerchantPin` separately holds the expected merchant public key and key fingerprint, tied to the same Business Passport and an offline synthetic authorization reference. **The verifier must retrieve this pin from a trusted separate process.** A signature demonstrates control of the supplied key, not legal control of a business or website.

`SyntheticIntakeReceipt` includes only grant ID, consent digest, canonical snapshot digest, acceptance timestamp, prior YC-49 diagnostic result and immutable false authority flags. No provider token, private OAuth code, password, raw Drive document or live merchant data is stored in the receipt.

## 3. Admission logic

`admitSyntheticMerchantSnapshot(passport, snapshot, signedGrant, pinnedMerchantKey, revokedIds, trustedClock)` passes iff:

1. Synthetic BG Business Passport has empty assurances and agent grants.
2. Grant business ID, key ID, consent reference, reserved source hostname and snapshot metadata match.
3. Scope, purpose and data class are exactly allowed and no elevated permission bit is true.
4. Grant age and time ordering are valid, maximum lifetime 30 days, snapshot observed within grant interval and YC-49's 7-day snapshot freshness.
5. Grant ID is absent from a verifier-supplied revocation set.
6. The offline pinned Ed25519 public key fingerprint matches and verifies a domain-separated signature over the grant's protected core.
7. The YC-49 snapshot's own parser/checks pass, and the generated receipt carries only bounded digests and diagnostics.

An expired, revoked, forged, broader-scope or cross-tenant grant is refused. No partial success produces an agent capability, legal accreditation or GEO ranking guarantee.

## 4. Provider bridge architecture (not implemented in YC-50)

| Carrier | Future onboarding channel | Minimum first permission | Hard stop |
| --- | --- | --- | --- |
| Merchant export | Direct, tenant-authenticated file/page snapshot submission | Upload only explicitly selected public business data | Unverified business ownership, missing purpose/rights |
| Google Drive / Workspace | Google OAuth with Google Picker / `drive.file` per-file scope | Read only merchant-selected/app-approved files where API permits | Broad Drive authorization, unreviewed data use, silent publication |
| Merchant site | Site-owner authorization plus domain-control challenge and bounded crawl schedule | Public HTML only, robots and owner scope observed | Unauthorized crawl, private URLs, SSRF or CDN blocking |
| Cloudflare | Merchant-approved scoped zone API token or separately validated delegated flow | Appropriate zone-specific read-only metadata | Global API key, DNS Edit, broad account scope, storing token in audit receipt |
| Cloudflare for SaaS | Customer-controlled custom-hostname validation, only if merchant opts to route traffic | Hostname validation and TLS onboarding | No presumption that SaaS hosting grants access to customer's Cloudflare account |

Cloudflare for SaaS solves custom-hostname routing and validation, **not** owner consent to read or mutate Cloudflare account resources. A generic Cloudflare "one-click OAuth" experience should not be advertised before a supported verified delegation channel and required scope are demonstrated.

## 5. Adversarial obligations

- Forged signature under a non-pinned merchant key -> reject.
- Altered grant fields after signing -> reject; source-host/domain swap -> reject.
- Invalid/mismatching business ID, consent ref or key fingerprint -> reject.
- Expired, future, overlong, revoked grants -> reject.
- Attempts to substitute Google Drive or Cloudflare access as manually submitted consent -> reject.
- Crawl, publication, agent authority and real ownership claims -> reject.
- Unsupported, stale or malformed YC-49 snapshots -> reject.
- Never use tokens in receipt; record digest without body; no live network traffic.

## 6. Real-world pilot prerequisites

Before ten real Bulgarian volunteer merchants:
- Demonstrate actual authorized human controls the business, and separately the site/account.
- Obtain documented consent, lawful purpose, scope, source-category permissions and retention schedule; legal signoff under relevant EU/BG regimes.
- Set OAuth and secret-vault controls, revocation and export, audit witnesses, rate limits and SSRF-safe acquisition.
- Define credible GEO SLA in terms of actions and measured outputs, not AI placement.
- Verify Yellow Pages Ltd agreement, partner data rights and outbound campaign authorization independently.
- Run site/Drive/Cloudflare adapters behind separate owner-approved feature gates and tenant isolation.

## Primary-source constraints

Google Drive OAuth per-file access: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
Cloudflare API tokens and per-zone scope: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
Cloudflare for SaaS hostname validation: https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/
Google Search AI features: https://developers.google.com/search/docs/appearance/ai-features
OpenAI crawler separation: https://developers.openai.com/api/docs/bots

## NEXT gate

YC-51: tenant-scoped **owner claim + site control challenge** protocol with replay-safe challenge consumption, independent business authority review, domain allowlist and SSRF/redirect controls. Google Picker OAuth and Cloudflare token custody are future provider-adapter tracks; no live accounts before explicit scope and deployment authorization.
