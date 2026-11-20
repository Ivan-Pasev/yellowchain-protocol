# YC-49 / Bulgarian GEO Readiness — Synthetic Merchant Diagnostic Contract

Status: **CANDIDATE — offline engineering only**
Date: 2026-11-20 · National pilot: `BG` · Canonical business ID from YC-41.

## Commercial purpose

YellowChain's first merchant-facing value should be an owner-controlled Business Passport and a measurable discovery-readiness report. GEO 365 is a managed assessment and improvement service, **not** a claim to purchase organic ranking, ChatGPT placement, a certification grade, or public legal verification.

The consented commercial pilot can use the same architecture across countries, but YC-49 itself consumes only synthetic Bulgarian fixtures. Data licensing, Yellow Pages partnership scope, opt-in, legitimate outreach eligibility and individual site authorization remain external gates.

## Contract shape

Input:
- YC-41 synthetic Business Passport (`BG`, `bg-BG`, business ID, company name, no assurances or action grants).
- Merchant-supplied snapshot with matching business ID, reserved `.example` / `.test` HTTPS host, timestamp no older than seven days, syntactic synthetic consent reference, observed HTTP status, canonical URL, HTML language, meta robots, per-crawler policy and visible/JSON-LD business names.

Output:
- `yc-geo-readiness/0.1.0` diagnostic receipt containing *individual evidence-limited findings* (`pass`, `blocked`, `review`, `unknown`).
- Counts of findings, not a composite "AI visibility" score.
- Immutable false flags for actual owner authorization verified, live crawling verified, AI citation verified, organic placement guaranteed, public business certificate, and agent action authority.

API: `GET /v1/geo/companies/:id/readiness` returns a **synthetic offline example** only; it never issues a crawl request or modifies the site.

## Checks and interpretation

| Diagnostic | Positive observation | Block/unknown caution |
| --- | --- | --- |
| HTTPS page | Approved synthetic HTTPS snapshot | Actual accessibility not established |
| HTTP response | Snapshot records 200 | 4xx/5xx and redirects warrant inspection |
| Robots meta | No observed `noindex` | Header-level directives separately unverified |
| Googlebot | Owner-supplied allow observation | Robots and CDN access may still differ |
| OAI-SearchBot | Owner-supplied allow observation | GPTBot training opt-out is separate |
| GPTBot training | Independent policy disclosure | No penalty inferred for training opt-out |
| Canonical URL | Expected merchant page consistency | Alternate canonical flagged for human review |
| Language | Bulgarian `bg` / `bg-BG` | Multilingual strategy requires separate evidence |
| Visible identity | Name matches canonical passport | Name drift goes to owner-review queue |
| LocalBusiness JSON-LD | Name consistent with visible identity | Data accuracy and rich-result eligibility not proven |
| Content and authority | Always UNKNOWN in YC-49 | Independent real evidence must be collected |

An unknown signal is never silently treated as a pass. Synthetic website snapshots are fixtures, not live Web measurements. The actual product must distinguish owner-submitted evidence from third-party observed facts, log audit time, respect robots/permissions, limit crawl rate and support correction and dispute workflows.

## Constitutional invariants

1. Synthetic input and public authority fields cannot be upgraded by a paid tier or a connected third-party account.
2. No third-party website is fetched or crawled without demonstrable authorization and use-permission.
3. Crawler permission is not search inclusion; indexing is not ranking; ranking is not AI citation; AI citation is not conversion.
4. Googlebot, OpenAI's OAI-SearchBot and GPTBot must not be collapsed into a single AI-bot flag.
5. JSON-LD reflects verifiable page content and business evidence; fabricated testimonials, ratings and identities are forbidden.
6. Business identity and vertical marketplace projections use one stable passport ID; each output has source, timestamp, locale and publication-rights gates.
7. Scores, when later introduced, must disclose method, coverage, uncertainty and audit input; no invented authority certificate.
8. Four national surfaces (companies, products, services, opinions) are projections, not four independent legal identities.
9. National `bg.yellowchain.org` and marketplace hostnames are architectural targets, not live deployment evidence.

## Acceptance and adversarial tests

- Synthetic passport/snapshot yields deterministic receipt, at least one unknown finding for unverified owner/legal authority, false placement/certificate/action flags.
- Explicit `noindex`, HTTP error and bot-specific `disallow` are marked blocked without reaching into actual sites.
- `GPTBot=disallow` does **not** downgrade OAI-SearchBot search permission.
- Name or canonical mismatch is review rather than automatic legal identity conflict.
- Unknown absent metadata remains unknown.
- Mismatched business ID, unsanctioned consent reference, stale timestamp, invalid HTTP status or real non-fixture domain are rejected.
- API returns 200 for synthetic fixture, 404 for unknown company, never performs outbound crawl or publication.
- Protocol schemas reject invented search placement, real-crawl, authorization and legal-certificate claims.

## External primary references

- Google's AI/Search guidance: https://developers.google.com/search/docs/appearance/ai-features
- Google local business structured data: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Google's Search Essentials: https://developers.google.com/search/docs/essentials
- OpenAI crawler separation: https://developers.openai.com/api/docs/bots
- Google's robots indexing directives: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag

## Commercial gates and NEXT

YC-50 candidate: scoped merchant BYOC onboarding and a real-but-consented website snapshot carrier, with domain/tenant ownership, OAuth authorizations and data-retention policy. Begin with ten volunteer Bulgarian merchants, then run a rights-approved 100-merchant pilot, and only then evaluate wider Yellow Pages outreach and 193-country partner federation.

**HOLD:** no actual website crawl, merchant authentication, domain redirect, database import, real business certificate, paid plan or outreach is authorized by YC-49.
