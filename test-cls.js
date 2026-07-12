#!/usr/bin/env node
/**
 * test-cls.js — Regression suite for the CLS v1.0 neonatal glucose surveillance tool.
 *
 * Runs the EXACT script embedded in index.html (extracted and eval'd against a
 * mocked DOM), not a reimplementation — so this test suite fails if index.html's
 * logic changes in a way that breaks any decision-table row or reference data
 * integrity check.
 *
 * Usage:
 *   node test-cls.js
 *
 * Exit code 0 = all tests passed. Exit code 1 = at least one failure (CI-friendly).
 * No npm install required — pure Node, no dependencies.
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const content = fs.readFileSync(indexPath, 'utf8');
const match = content.match(/<script>([\s\S]*?)<\/script>/);
if (!match) {
  console.error('Could not find <script> block in index.html');
  process.exit(1);
}
const script = match[1];

// ---- Minimal DOM mock ----
function makeEl() {
  return {
    checked: false,
    value: '',
    style: {},
    _html: '',
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html; }
  };
}

const FIELD_IDS = ['symptomatic', 'persistent', 'nicu', 'metabolic', 'exclusionBanner',
  'mainForm', 'gaWeeks', 'gaDays', 'sex', 'bw', 'diabetes', 'betaBlocker', 'results'];

const elements = {};
FIELD_IDS.forEach(id => { elements[id] = makeEl(); });

global.document = {
  getElementById: (id) => elements[id],
  querySelectorAll: () => ({ forEach: () => {} })
};

// `const` bindings from eval() don't leak to the enclosing scope the way function
// declarations do — append explicit exposure lines and eval as ONE call so they
// share REF's lexical scope. This changes nothing about the app's own logic.
eval(script + '\nglobal.REF = REF; global.BASE_DURATION = BASE_DURATION;');

// ---- Test runner ----
let pass = 0, fail = 0;
const failures = [];

function setInputs({ symptomatic = false, persistent = false, nicu = false, metabolic = false,
  gaWeeks, gaDays = 0, sex, bw, diabetes = 'none', betaBlocker = false }) {
  elements.symptomatic.checked = symptomatic;
  elements.persistent.checked = persistent;
  elements.nicu.checked = nicu;
  elements.metabolic.checked = metabolic;
  elements.gaWeeks.value = gaWeeks;
  elements.gaDays.value = gaDays;
  elements.sex.value = sex;
  elements.bw.value = bw;
  elements.diabetes.value = diabetes;
  elements.betaBlocker.checked = betaBlocker;
}

function check(name, inputs, expect) {
  setInputs(inputs);
  computeAll();
  const html = elements.results.innerHTML;
  const excluded = elements.exclusionBanner.style.display === 'block';

  const problems = [];

  if (expect.excluded !== undefined && excluded !== expect.excluded) {
    problems.push(`excluded: got ${excluded}, want ${expect.excluded}`);
  }
  if (expect.noScreening && !html.includes('No screening recommended')) {
    problems.push('expected "No screening recommended"');
  }
  if (expect.duration !== undefined) {
    const m = html.match(/continue to (\d+(?:\.\d+)?)h/);
    const got = m ? parseFloat(m[1]) : null;
    if (got !== expect.duration) problems.push(`duration: got ${got}, want ${expect.duration}`);
  }
  if (expect.factorsInclude) {
    for (const f of expect.factorsInclude) {
      if (!html.includes(f)) problems.push(`missing factor label "${f}"`);
    }
  }
  if (expect.factorsExclude) {
    for (const f of expect.factorsExclude) {
      if (html.includes(f)) problems.push(`unexpected factor label "${f}" present`);
    }
  }

  if (problems.length === 0) {
    pass++;
    console.log(`PASS  ${name}`);
  } else {
    fail++;
    failures.push(`${name}\n    ${problems.join('\n    ')}`);
    console.log(`FAIL  ${name}`);
  }
}

const L = { P: 'Preterm', S: 'SGA', L: 'LGA', I: 'Infant of diabetic mother', M: 'Maternal beta-blocker' };

// ============================================================
// Reference infants (all male, chosen to land cleanly inside a
// single classification band with no ambiguity near boundaries)
// ============================================================
const TERM_AGA   = { gaWeeks: 40, bw: 3613 };  // = p50 exactly
const TERM_SGA   = { gaWeeks: 40, bw: 2950 };  // between p5/p10 (~5.8th pctile)
const TERM_LGA   = { gaWeeks: 40, bw: 4300 };  // between p90/p95 (~92.8th pctile)
const PT_AGA     = { gaWeeks: 34, bw: 2360 };  // = p50 at 34wk
const PT_SGA     = { gaWeeks: 34, bw: 1700 };  // between p5/p10
const PT_LGA     = { gaWeeks: 34, bw: 3000 };  // between p90/p95

function infant(base, extra) { return { ...base, sex: 'male', diabetes: 'none', betaBlocker: false, ...extra }; }

// ============================================================
// Row 0 — no risk factors
// ============================================================
check('Row 0: no risk factors', infant(TERM_AGA), { noScreening: true });

// ============================================================
// Rows 1-5 — single factor
// ============================================================
check('Row 1: P only',  infant(PT_AGA),   { duration: 24, factorsInclude: [L.P] });
check('Row 2: S only',  infant(TERM_SGA), { duration: 24, factorsInclude: [L.S] });
check('Row 3: L only',  infant(TERM_LGA), { duration: 12, factorsInclude: [L.L] });
check('Row 4: I only',  infant(TERM_AGA, { diabetes: 'gdm' }),   { duration: 12, factorsInclude: [L.I] });
check('Row 5: M only',  infant(TERM_AGA, { betaBlocker: true }), { duration: 24, factorsInclude: [L.M] });

// ============================================================
// Rows 6-14 — two factors (9 rows)
// ============================================================
check('Row 6: P+S',  infant(PT_SGA),                              { duration: 24, factorsInclude: [L.P, L.S] });
check('Row 7: P+L',  infant(PT_LGA),                              { duration: 24, factorsInclude: [L.P, L.L] });
check('Row 8: P+I',  infant(PT_AGA, { diabetes: 'type1' }),       { duration: 24, factorsInclude: [L.P, L.I] });
check('Row 9: P+M',  infant(PT_AGA, { betaBlocker: true }),       { duration: 24, factorsInclude: [L.P, L.M] });
check('Row 10: S+I', infant(TERM_SGA, { diabetes: 'type2' }),     { duration: 24, factorsInclude: [L.S, L.I] });
check('Row 11: S+M', infant(TERM_SGA, { betaBlocker: true }),     { duration: 24, factorsInclude: [L.S, L.M] });
check('Row 12: L+I', infant(TERM_LGA, { diabetes: 'gdm' }),       { duration: 12, factorsInclude: [L.L, L.I] });
check('Row 13: L+M', infant(TERM_LGA, { betaBlocker: true }),     { duration: 24, factorsInclude: [L.L, L.M] });
check('Row 14: I+M', infant(TERM_AGA, { diabetes: 'type1', betaBlocker: true }), { duration: 24, factorsInclude: [L.I, L.M] });

// ============================================================
// Rows 15-21 — three factors (7 rows)
// ============================================================
check('Row 15: P+S+I', infant(PT_SGA, { diabetes: 'gdm' }),       { duration: 24, factorsInclude: [L.P, L.S, L.I] });
check('Row 16: P+S+M', infant(PT_SGA, { betaBlocker: true }),     { duration: 24, factorsInclude: [L.P, L.S, L.M] });
check('Row 17: P+L+I', infant(PT_LGA, { diabetes: 'type2' }),     { duration: 24, factorsInclude: [L.P, L.L, L.I] });
check('Row 18: P+L+M', infant(PT_LGA, { betaBlocker: true }),     { duration: 24, factorsInclude: [L.P, L.L, L.M] });
check('Row 19: P+I+M', infant(PT_AGA, { diabetes: 'type1', betaBlocker: true }), { duration: 24, factorsInclude: [L.P, L.I, L.M] });
check('Row 20: S+I+M', infant(TERM_SGA, { diabetes: 'gdm', betaBlocker: true }), { duration: 24, factorsInclude: [L.S, L.I, L.M] });
check('Row 21: L+I+M', infant(TERM_LGA, { diabetes: 'type2', betaBlocker: true }), { duration: 24, factorsInclude: [L.L, L.I, L.M] });

// ============================================================
// Rows 22-23 — four factors
// ============================================================
check('Row 22: P+S+I+M', infant(PT_SGA, { diabetes: 'gdm', betaBlocker: true }), { duration: 24, factorsInclude: [L.P, L.S, L.I, L.M] });
check('Row 23: P+L+I+M', infant(PT_LGA, { diabetes: 'type1', betaBlocker: true }), { duration: 24, factorsInclude: [L.P, L.L, L.I, L.M] });

// ============================================================
// Invalid-combination guard: S and L should never co-occur
// ============================================================
check('S/L mutual exclusion: SGA infant never labeled LGA', infant(TERM_SGA), { factorsExclude: [L.L] });
check('S/L mutual exclusion: LGA infant never labeled SGA', infant(TERM_LGA), { factorsExclude: [L.S] });

// ============================================================
// Exclusion gate — each trigger independently
// ============================================================
check('Exclusion: symptomatic', infant(TERM_AGA, { symptomatic: true }), { excluded: true });
check('Exclusion: persistent >72h', infant(TERM_AGA, { persistent: true }), { excluded: true });
check('Exclusion: NICU', infant(TERM_AGA, { nicu: true }), { excluded: true });
check('Exclusion: metabolic/endocrine disease', infant(TERM_AGA, { metabolic: true }), { excluded: true });
check('No exclusion when no flags set', infant(TERM_AGA), { excluded: false });

// ============================================================
// Reference table integrity (static checks, no DOM involved)
// ============================================================
function integrityCheck(name, fn) {
  try {
    fn();
    pass++;
    console.log(`PASS  ${name}`);
  } catch (e) {
    fail++;
    failures.push(`${name}\n    ${e.message}`);
    console.log(`FAIL  ${name}`);
  }
}

integrityCheck('Reference table: 44 rows present (22-43wk x 2 sexes)', () => {
  for (const sex of ['male', 'female']) {
    for (let w = 22; w <= 43; w++) {
      if (!REF[sex][w]) throw new Error(`missing ${sex} week ${w}`);
    }
  }
});

integrityCheck('Reference table: monotonic percentiles in every row', () => {
  const keys = ['p3', 'p5', 'p10', 'p50', 'p90', 'p95', 'p97'];
  for (const sex of ['male', 'female']) {
    for (let w = 22; w <= 43; w++) {
      const row = REF[sex][w];
      for (let i = 0; i < keys.length - 1; i++) {
        if (row[keys[i]] > row[keys[i + 1]]) {
          throw new Error(`${sex} week ${w}: ${keys[i]}=${row[keys[i]]} > ${keys[i + 1]}=${row[keys[i + 1]]}`);
        }
      }
    }
  }
});

integrityCheck('Reference table: matches CPS Table 2 at 37wk (cross-source check)', () => {
  // CPS excerpt: 37wk male 10th=2552 90th=3665; female 10th=2452 90th=3543
  const m = REF.male[37], f = REF.female[37];
  if (m.p10 !== 2552 || m.p90 !== 3665) throw new Error(`male 37wk mismatch: p10=${m.p10} p90=${m.p90}`);
  if (f.p10 !== 2452 || f.p90 !== 3543) throw new Error(`female 37wk mismatch: p10=${f.p10} p90=${f.p90}`);
});

// ============================================================
// Summary
// ============================================================
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log('\nFailure details:');
  failures.forEach(f => console.log(`- ${f}`));
  process.exit(1);
}
