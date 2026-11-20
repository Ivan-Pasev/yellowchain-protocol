import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const load = (relative) => JSON.parse(readFileSync(new URL('../' + relative, import.meta.url), 'utf8'));
const schema = load('schemas/passport/business-passport-public.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const accepted = load('schemas/passport/fixtures/synthetic-bg-passport.valid.json');
const rejected = load('schemas/passport/fixtures/synthetic-overclaim.rejected.json');
const clone = (value) => JSON.parse(JSON.stringify(value));
const check = (data, expected, label) => {
  const actual = validate(data);
  assert.equal(actual, expected, label + ': ' + JSON.stringify(validate.errors));
};
check(accepted, true, 'synthetic preview accepted');
check(rejected, false, 'synthetic certificate/capability overclaim rejected');

const sourceSpoof = clone(accepted);
sourceSpoof.provenance.synthetic = false;
sourceSpoof.publication.status = 'draft';
check(sourceSpoof, false, 'synthetic source cannot be declared real');

const unlicensedPublish = clone(accepted);
unlicensedPublish.provenance.synthetic = false;
unlicensedPublish.provenance.source_category = 'merchant_submission';
unlicensedPublish.publication.status = 'published';
check(unlicensedPublish, false, 'publishing requires authority and rights');

const draft = clone(accepted);
draft.provenance.synthetic = false;
draft.provenance.source_category = 'merchant_submission';
draft.publication.status = 'draft';
check(draft, true, 'non-synthetic draft shape accepted without assurance');

const assuranceOnDraft = clone(draft);
assuranceOnDraft.assurances = [{
  assurance_id: 'test-only-01', tier: 'YC-2', claim_scope: 'subject identity',
  issuer_id: 'test-only-issuer', policy_version: 'test-0.1',
  evidence_refs: ['test:evidence:1'], issued_at: '2026-11-20T00:00:00Z',
  expires_at: '2026-12-20T00:00:00Z', status: 'active',
  status_endpoint: 'https://example.org/status/test-only-01',
}];
check(assuranceOnDraft, false, 'unpublished public assurance rejected');

const grantOnDraft = clone(draft);
grantOnDraft.agent_capabilities = [{
  capability_id: 'test-only-grant', action_scope: 'quote.read',
  grant_ref: 'test:grant:1', expires_at: '2026-12-20T00:00:00Z',
  revocation_endpoint: 'https://example.org/grants/test-only-grant/status',
}];
check(grantOnDraft, false, 'unpublished agent descriptor rejected');

console.log('YC41_PASSPORT_JSON_SCHEMA_CONTRACT_PASS: 7 cases');
