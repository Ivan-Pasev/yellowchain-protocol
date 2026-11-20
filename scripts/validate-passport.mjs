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
// Shape-level issuer checks; cryptographic truth is tested in the private runtime.
const fixture = {
  issuer: {
    synthetic: true, issuer_id: 'yc:test:issuer:001', jurisdiction: 'BG',
    policy_version: 'yc43-synthetic-0.1', approved_tiers: ['YC-2'],
    approved_claim_scopes: ['legal_entity_identity'],
    public_key_pem: '-----BEGIN PUBLIC KEY-----\\nSYNTHETIC_SHAPE_ONLY\\n-----END PUBLIC KEY-----',
    effective_at: '2026-11-01T00:00:00Z', expires_at: '2027-01-01T00:00:00Z',
    state: 'active', registry_event_id: 'synthetic:issuer:001',
  },
  assurance: {
    version: 'yc-assurance/0.1.0', credential_id: 'yc:test:credential:001',
    subject_business_id: 'yc:business:BG:yc_bg_synth_company_001',
    issuer_id: 'yc:test:issuer:001', tier: 'YC-2', claim_scope: 'legal_entity_identity',
    policy_version: 'yc43-synthetic-0.1', evidence_refs: ['synthetic:evidence:001'],
    issued_at: '2026-11-20T09:00:00Z', expires_at: '2026-12-20T09:00:00Z',
    signature_alg: 'Ed25519', signature_b64url: 'syntheticOnly',
  },
  status: {
    version: 'yc-issuer-status/0.1.0', credential_id: 'yc:test:credential:001',
    issuer_id: 'yc:test:issuer:001', state: 'active',
    observed_at: '2026-11-20T09:59:00Z', valid_until: '2026-11-20T10:01:00Z',
    signature_alg: 'Ed25519', signature_b64url: 'syntheticOnly',
  },
};
for (const [name, value] of Object.entries({
  issuer: 'schemas/issuer/issuer-authority.synthetic.schema.json',
  assurance: 'schemas/issuer/assurance-envelope.synthetic.schema.json',
  status: 'schemas/issuer/status-receipt.synthetic.schema.json',
})) {
  const checkIssuerShape = ajv.compile(load(value));
  assert.equal(checkIssuerShape(fixture[name]), true, name + ' valid shape');
  const tampered = clone(fixture[name]);
  delete tampered.signature_alg;
  if (name === 'issuer') delete tampered.registry_event_id;
  assert.equal(checkIssuerShape(tampered), false, name + ' missing required authority field');
}
console.log('YC43_ISSUER_WIRE_SHAPE_CONTRACT_PASS: 6 cases');
const lifecycleSchema = load('schemas/issuer/lifecycle-event.synthetic.schema.json');
const validateLifecycle = ajv.compile(lifecycleSchema);
const registration = {
  event_id: 'synthetic:event:1', sequence: 1, previous_hash: 'GENESIS',
  event_hash: 'a'.repeat(64), action: 'issuer.register',
  subject_id: 'synthetic:issuer:alpha', issuer_id: 'synthetic:issuer:alpha',
  actor_id: 'synthetic:gov', actor_role: 'registry_governor',
  authorization_ref: 'synthetic:grant:gov', policy_version: 'synthetic:policy:0.1',
  evidence_refs: ['synthetic:evidence:1'], occurred_at: '2026-11-20T09:00:00Z',
  key_fingerprint: 'sha256:' + 'b'.repeat(64),
};
const checkLifecycle = (data, expected, name) =>
  assert.equal(validateLifecycle(data), expected, name + ': ' + JSON.stringify(validateLifecycle.errors));
checkLifecycle(registration, true, 'issuer registration shape');
checkLifecycle({ ...registration, actor_role: 'security_custodian' }, false, 'role mismatch');
const missingKey = clone(registration);
delete missingKey.key_fingerprint;
checkLifecycle(missingKey, false, 'registration missing key');
const extraneousKey = { ...registration, action: 'issuer.activate' };
checkLifecycle(extraneousKey, false, 'key included in non-rotation action');
checkLifecycle({ ...registration, evidence_refs: [] }, false, 'evidence absent');
checkLifecycle({ ...registration, event_hash: 'not-a-digest' }, false, 'malformed event digest');
console.log('YC44_LIFECYCLE_EVENT_SHAPE_CONTRACT_PASS: 6 cases');


const checkpointSchema = load('schemas/issuer/checkpoint.synthetic.schema.json');
const validateCheckpoint = ajv.compile(checkpointSchema);
const checkpoint = {
  version: 'yc-checkpoint/0.1.0',
  origin: 'synthetic:yellowchain:BG:issuer-registry',
  sequence: 4,
  event_head_hash: 'a'.repeat(64),
  state_hash: 'b'.repeat(64),
  previous_checkpoint_digest: 'c'.repeat(64),
  issued_at: '2026-11-20T09:35:00Z',
  log_signature_b64url: 'syntheticLogShapeOnly',
  witness_signatures: [
    { witness_id: 'synthetic:witness:1', signature_b64url: 'syntheticWitnessOne' },
    { witness_id: 'synthetic:witness:2', signature_b64url: 'syntheticWitnessTwo' },
  ],
};
const checkCheckpoint = (data, expected, label) =>
  assert.equal(validateCheckpoint(data), expected,
    label + ': ' + JSON.stringify(validateCheckpoint.errors));
checkCheckpoint(checkpoint, true, 'synthetic witnessed checkpoint shape');
checkCheckpoint({ ...checkpoint, sequence: 0 }, false, 'zero sequence rejected');
checkCheckpoint({ ...checkpoint, event_head_hash: 'spoof' }, false, 'malformed event head rejected');
checkCheckpoint({ ...checkpoint, witness_signatures: checkpoint.witness_signatures.slice(0, 1) }, false, 'one witness rejected');
checkCheckpoint({ ...checkpoint, origin: 'live:yellowchain:BG:issuer-registry' }, false, 'public origin rejected');
checkCheckpoint({ ...checkpoint, public_claim_allowed: true }, false, 'public assurance promotion rejected');
checkCheckpoint({ ...checkpoint, issued_at: 'not-a-date' }, false, 'invalid issued_at rejected');
checkCheckpoint({ ...checkpoint, previous_checkpoint_digest: 'GENESIS' }, true, 'genesis reference shape accepted');
console.log('YC45_CHECKPOINT_WIRE_SHAPE_PASS: 8 cases; runtime required for signature/quorum/replay');

const trustTransitionSchema = load('schemas/issuer/trust-transition.synthetic.schema.json');
const validateTransition = ajv.compile(trustTransitionSchema);
const transitionFixture = {
  version: 'yc-trust-transition/0.1.0',
  origin: 'synthetic:yellowchain:BG:issuer-registry',
  from_epoch: 1, to_epoch: 2,
  from_epoch_digest: 'a'.repeat(64),
  to_epoch_digest: 'b'.repeat(64),
  anchor_checkpoint_digest: 'c'.repeat(64),
  issued_at: '2026-11-20T09:40:00Z',
  old_witness_signatures: [
    {witness_id:'synthetic:witness:1',signature_b64url:'oldOne'},
    {witness_id:'synthetic:witness:2',signature_b64url:'oldTwo'},
  ],
  new_witness_signatures: [
    {witness_id:'synthetic:witness:2',signature_b64url:'newTwo'},
    {witness_id:'synthetic:witness:4',signature_b64url:'newFour'},
  ],
};
const checkTransition = (value, expected, label) =>
  assert.equal(validateTransition(value), expected,
    label + ': ' + JSON.stringify(validateTransition.errors));
checkTransition(transitionFixture, true, 'synthetic dual quorum shape');
checkTransition({...transitionFixture, origin:'live:yellowchain:BG'}, false, 'synthetic origin pinned');
checkTransition({...transitionFixture, to_epoch:0}, false, 'invalid target epoch');
checkTransition({...transitionFixture, anchor_checkpoint_digest:'invalid'}, false, 'anchor digest format');
checkTransition({...transitionFixture, old_witness_signatures:[]}, false, 'old quorum shape');
checkTransition({...transitionFixture, new_witness_signatures:[]}, false, 'new quorum shape');
checkTransition({...transitionFixture, public_claim_allowed:true}, false, 'authority promotion impossible');
checkTransition({...transitionFixture, issued_at:'not-time'}, false, 'timestamp required');
console.log('YC46_TRUST_EPOCH_TRANSITION_SHAPE_PASS: 8 cases; runtime verifies signatures and CAS');

const splitViewSchema = load('schemas/issuer/split-view.synthetic.schema.json');
const validateSplitView = ajv.compile(splitViewSchema);
const splitViewFixture = {
  version: 'yc-split-view/0.1.0',
  origin: 'synthetic:yellowchain:BG:issuer-registry',
  sequence: 3,
  predecessor_digest: 'a'.repeat(64),
  left_checkpoint_digest: 'b'.repeat(64),
  right_checkpoint_digest: 'c'.repeat(64),
  left: {checkpoint, history:[registration]},
  right: {checkpoint:{...checkpoint,event_head_hash:'d'.repeat(64)}, history:[registration]},
  observed_at: '2026-11-20T10:00:00Z',
  boundary: 'synthetic-split-view-not-public-issuance',
  public_claim_allowed:false,agent_action_allowed:false,
};
const checkSplitView=(value,expected,label)=>assert.equal(
  validateSplitView(value),expected,label+': '+JSON.stringify(validateSplitView.errors));
checkSplitView(splitViewFixture,true,'synthetic fork envelope');
checkSplitView({...splitViewFixture,origin:'live:BG'},false,'synthetic origin');
checkSplitView({...splitViewFixture,predecessor_digest:'invalid'},false,'predecessor digest');
checkSplitView({...splitViewFixture,left:{...splitViewFixture.left,history:[]}},false,'empty proof history');
checkSplitView({...splitViewFixture,agent_action_allowed:true},false,'agent action promotion');
checkSplitView({...splitViewFixture,public_claim_allowed:true},false,'business certificate promotion');
checkSplitView({...splitViewFixture,left:{...splitViewFixture.left,checkpoint:{...checkpoint,witness_signatures:[]}}},false,'unsigned-view shape');
checkSplitView({...splitViewFixture,boundary:'production-certified'},false,'production overclaim');
console.log('YC47_SPLIT_VIEW_SHAPE_PASS: 8 cases; runtime must verify two forks and predecessor');

const yc48PolicySchema = load('schemas/issuer/offline-trust-policy.synthetic.schema.json');
const yc48PinSchema = load('schemas/issuer/offline-root-pin.synthetic.schema.json');
const validateYc48Policy = ajv.compile(yc48PolicySchema);
const validateYc48Pin = ajv.compile(yc48PinSchema);
const yc48Fixture = {
  version:'yc-trust-policy/0.1.0',
  origin:'synthetic:yellowchain:BG:issuer-registry',
  policy_version:1,previous_policy_digest:'GENESIS',
  anchor_digest:'a'.repeat(64),trust_epoch_digest:'b'.repeat(64),
  issued_at:'2026-11-20T09:15:00Z',expires_at:'2026-12-01T09:15:00Z',
  root_threshold:2,root_keys:[
    {key_id:'synthetic:root:r1',public_key_pem:'-----BEGIN PUBLIC KEY----- synthetic shape r1'},
    {key_id:'synthetic:root:r2',public_key_pem:'-----BEGIN PUBLIC KEY----- synthetic shape r2'},
    {key_id:'synthetic:root:r3',public_key_pem:'-----BEGIN PUBLIC KEY----- synthetic shape r3'},
  ],
  operator_claims:[1,2,3].map(i=>({
    witness_id:'synthetic:witness:'+i,operator_id:'synthetic:operator:'+i,
    custody_evidence_ref:'synthetic:evidence:operator'+i,
    independence_review:'self-declared-unverified',
  })),
  boundary:'synthetic-policy-not-public-authority',
  public_claim_allowed:false,agent_action_allowed:false,
  old_root_signatures:[],
  new_root_signatures:[
    {key_id:'synthetic:root:r1',signature_b64url:'shapeOnlyR1'},
    {key_id:'synthetic:root:r2',signature_b64url:'shapeOnlyR2'},
  ],
};
const yc48Pin = {
  origin:yc48Fixture.origin,manifest_digest:'c'.repeat(64),
  root_threshold:2,authorization_ref:'synthetic:offline-approved:research',
  root_key_fingerprints:[
    {key_id:'synthetic:root:r1',fingerprint:'d'.repeat(64)},
    {key_id:'synthetic:root:r2',fingerprint:'e'.repeat(64)},
    {key_id:'synthetic:root:r3',fingerprint:'f'.repeat(64)},
  ],
};
const yc48Shape = (candidate,expected,name)=>assert.equal(
  validateYc48Policy(candidate),expected,name+': '+JSON.stringify(validateYc48Policy.errors));
const yc48PinShape = (candidate,expected,name)=>assert.equal(
  validateYc48Pin(candidate),expected,name+': '+JSON.stringify(validateYc48Pin.errors));
yc48Shape(yc48Fixture,true,'signed offline root policy');
yc48Shape({...yc48Fixture,origin:'live:BG'},false,'synthetic origin only');
yc48Shape({...yc48Fixture,root_threshold:1},false,'root threshold at least 2');
yc48Shape({...yc48Fixture,old_root_signatures:[{key_id:'impostor',signature_b64url:'a'}]},false,'root signer shape');
yc48Shape({...yc48Fixture,new_root_signatures:[]},false,'new signing quorum shape');
yc48Shape({...yc48Fixture,operator_claims:[{...yc48Fixture.operator_claims[0],independence_review:'certified'}]},false,'unverified operator only');
yc48Shape({...yc48Fixture,public_claim_allowed:true},false,'no public authority promotion');
yc48Shape({...yc48Fixture,agent_action_allowed:true},false,'no agent action promotion');
yc48Shape({...yc48Fixture,previous_policy_digest:'fake'},false,'policy digest chain');
yc48PinShape(yc48Pin,true,'offline pin wire shape');
yc48PinShape({...yc48Pin,authorization_ref:'self-verified'},false,'offline carrier requirement');
yc48PinShape({...yc48Pin,manifest_digest:'nothex'},false,'root manifest fingerprint');
console.log('YC48_OFFLINE_ROOT_POLICY_SHAPE_PASS: 12 cases; runtime verifies offline pin, cryptographic quorums, time and chain');

const yc49SnapshotSchema = ajv.compile(load('schemas/geo/merchant-snapshot.synthetic.schema.json'));
const yc49ReceiptSchema = ajv.compile(load('schemas/geo/readiness-receipt.synthetic.schema.json'));
const yc49Snapshot = {
 boundary:'synthetic-owner-supplied-geo-snapshot',
 business_id:'yc:business:BG:yc_bg_synth_company_001',
 page_url:'https://merchant.example/bg',observed_at:'2026-11-20T10:00:00Z',
 consent_ref:'synthetic:consent:fixture',http_status:200,canonical_url:'https://merchant.example/bg',
 html_lang:'bg-BG',robots_meta:'index,follow',googlebot_policy:'unknown',
 oai_searchbot_policy:'unknown',gptbot_training_policy:'disallow',
 visible_business_name:'Synthetic Bulgarian Company',
 localbusiness_jsonld_name:'Synthetic Bulgarian Company'
};
const yc49Receipt = {
 version:'yc-geo-readiness/0.1.0',boundary:'synthetic-diagnostic-not-search-placement',
 jurisdiction:'BG',business_id:yc49Snapshot.business_id,snapshot_observed_at:yc49Snapshot.observed_at,
 measured:{pass:3,blocked:0,review:1,unknown:2},
 signals:[{id:'googlebot',status:'unknown',evidence:'not_observed',recommendation:'Check robots.txt'}],
 authorization_verified:false,external_crawl_verified:false,ai_citation_verified:false,
 organic_placement_guaranteed:false,public_claim_allowed:false,agent_action_allowed:false
};
const yc49Check = (fn,object,valid,label)=>assert.equal(fn(object),valid,
 label+': '+JSON.stringify(fn.errors));
yc49Check(yc49SnapshotSchema,yc49Snapshot,true,'synthetic owner snapshot');
yc49Check(yc49SnapshotSchema,{...yc49Snapshot,boundary:'live'},false,'real site implication rejected');
yc49Check(yc49SnapshotSchema,{...yc49Snapshot,consent_ref:'self_authorized'},false,'consent shape');
yc49Check(yc49SnapshotSchema,{...yc49Snapshot,oai_searchbot_policy:'guaranteed'},false,'unknown crawler claim');
yc49Check(yc49SnapshotSchema,{...yc49Snapshot,page_url:'http://merchant.example/bg'},false,'HTTP page rejected');
yc49Check(yc49ReceiptSchema,yc49Receipt,true,'bounded readiness receipt');
yc49Check(yc49ReceiptSchema,{...yc49Receipt,public_claim_allowed:true},false,'assurance overclaim');
yc49Check(yc49ReceiptSchema,{...yc49Receipt,organic_placement_guaranteed:true},false,'ranking guarantee overclaim');
yc49Check(yc49ReceiptSchema,{...yc49Receipt,external_crawl_verified:true},false,'crawl proof overclaim');
yc49Check(yc49ReceiptSchema,{...yc49Receipt,authorization_verified:true},false,'consent proof overclaim');
yc49Check(yc49ReceiptSchema,{...yc49Receipt,ai_citation_verified:true},false,'citation proof overclaim');
yc49Check(yc49ReceiptSchema,{...yc49Receipt,signals:[{...yc49Receipt.signals[0],status:'certified'}]},false,'invented signal outcome');
console.log('YC49_GEO_READINESS_SHAPE_PASS: 12 cases; runtime checks synthetic host and signal provenance');
