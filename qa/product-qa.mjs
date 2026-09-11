import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { brandBrief, creators } from "../src/fixtures.js";
import {
  evaluateCreator,
  getAllocation,
  getBaselineRanking,
  getDecisionResults,
  compareSelections
} from "../src/engine.js";

const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../dist/styles.css", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const uiSurface = `${html}\n${appSource}`;

const results = getDecisionResults(brandBrief, creators);
const allocation = getAllocation(brandBrief, creators);
const comparison = compareSelections(brandBrief, creators);
const byCode = new Map(results.map((result) => [result.creator.code, result]));

const qa = [];
function pass(id, finding) {
  qa.push({ id, status: "PASS", finding });
}

assert.equal(brandBrief.market, "India");
assert.equal(brandBrief.product, "India-only plant protein");
assert.equal(brandBrief.totalBudgetInr, 100000);
assert.equal(brandBrief.contributionMarginInr, 800);
assert.match(uiSurface, /Brand investment brief/);
pass("brief", "Brand brief captures India-only market, margin, budget, target, objective, and product positioning.");

assert.equal(creators.length, 4);
for (const creator of creators) {
  assert.match(creator.fixtureProvenance, /Synthetic creator fixture/);
  assert.ok(creator.marketEvidenceLabel);
  assert.ok(creator.evidenceQualityLabel);
}
assert.match(uiSurface, /Evidence and provenance/);
pass("provenance", "Every creator fixture has explicit synthetic provenance and visible evidence labels.");

assert.equal(byCode.get("A").breakEvenOrders, 69);
assert.equal(byCode.get("B").breakEvenOrders, 40);
assert.equal(byCode.get("C").breakEvenOrders, 28);
assert.equal(byCode.get("D").breakEvenOrders, 20);
assert.match(uiSurface, /Economic threshold/);
pass("economics", "Break-even orders are deterministic fee divided by contribution margin, rounded up.");

assert.equal(byCode.get("B").decisionClass, "invest");
assert.equal(byCode.get("C").decisionClass, "avoid");
assert.notEqual(byCode.get("A").decisionClass, byCode.get("B").decisionClass);
pass("decision rules", "Verdicts combine economics, content fit, buyer fit, market evidence, and evidence quality.");

assert.equal(byCode.get("A").decisionClass, "hold");
assert.ok(byCode.get("A").riskFlags.includes("Verified Indian audience share"));
assert.match(uiSurface, /Decision-critical uncertainty/);
pass("uncertainty", "Unknown India-audience evidence visibly changes Creator A from attractive to hold/verify.");

assert.equal(byCode.get("B").verdict, "INVEST");
assert.equal(byCode.get("D").verdict, "CONDITIONAL TEST");
assert.equal(byCode.get("C").verdict, "DO NOT PRIORITIZE");
pass("verdicts", "Each evaluated creator receives an actionable verdict rather than a vanity score.");

assert.equal(allocation.committedInr, 48000);
assert.equal(allocation.holdInr, 52000);
assert.deepEqual(allocation.selected.map((result) => result.creator.code), ["B", "D"]);
pass("allocation", "Comparative allocation invests ₹32K in B, conditionally tests D, and holds ₹52K.");

const baseline = getBaselineRanking(creators).map((item) => item.creator.code);
assert.deepEqual(baseline, ["A", "C", "B", "D"]);
assert.equal(comparison.materiallyDifferent, true);
assert.match(comparison.caveat, /do not establish better campaign outcomes/);
// Independent synthetic controls: no A-D identity or expected demo allocation.
const control = {
  id: "control", code: "CONTROL", name: "Synthetic control",
  feeInr: 16000, followers: 10000, engagementRate: 2,
  contentFit: "very-strong", marketEvidence: "strong", buyerFit: "strong",
  evidenceQuality: "strong", missingEvidence: [],
  fixtureProvenance: "Synthetic counterfactual; not live evidence."
};
const evaluate = (changes = {}, brief = brandBrief) => evaluateCreator(brief, { ...control, ...changes });
const cases = [];
function counterfactual(name, check) {
  check();
  cases.push({ test: name, status: "PASS" });
}
counterfactual("Evidence quality alone: invest → conditional → hold", () => {
  assert.equal(evaluate().decisionClass, "invest");
  assert.equal(evaluate({ evidenceQuality: "moderate" }).decisionClass, "conditional");
  for (const evidenceQuality of ["mixed", "unknown", undefined]) {
    const result = evaluate({ evidenceQuality });
    assert.equal(result.decisionClass, "hold");
    assert.match(result.reasons.join(" "), /evidence quality/);
    assert.ok(result.conditions.length);
  }
  assert.equal(evaluate({ evidenceQuality: "moderate", feeInr: 32000 }).decisionClass, "hold");
});
counterfactual("Fee alone crosses investment and test boundaries", () => {
  assert.equal(evaluate({ feeInr: 36001 }).decisionClass, "avoid");
  assert.equal(evaluate({ feeInr: 36000 }).decisionClass, "invest");
  assert.equal(evaluate({ feeInr: 20001, marketEvidence: "medium" }).decisionClass, "avoid");
  assert.equal(evaluate({ feeInr: 20000, marketEvidence: "medium" }).decisionClass, "conditional");
});
counterfactual("Geography verification alone changes hold to invest", () => {
  const unknown = evaluate({ marketEvidence: "unknown" });
  assert.equal(unknown.decisionClass, "hold");
  assert.match(unknown.conditions.join(" "), /Indian audience/);
  assert.equal(evaluate({ marketEvidence: "strong" }).decisionClass, "invest");
  assert.equal(evaluate({ marketEvidence: "strong", evidenceQuality: "mixed" }).decisionClass, "hold");
});
counterfactual("Margin alone changes hurdle and allocation", () => {
  const sample = { ...control, feeInr: 32000 };
  const lowMargin = { ...brandBrief, contributionMarginInr: 400 };
  assert.equal(evaluateCreator(brandBrief, sample).breakEvenOrders, 40);
  assert.equal(evaluateCreator(lowMargin, sample).breakEvenOrders, 80);
  assert.equal(getAllocation(brandBrief, [sample]).committedInr, 32000);
  assert.equal(getAllocation(lowMargin, [sample]).committedInr, 0);
});
counterfactual("High reach cannot override weak evidence or unknown geography", () => {
  for (const weakness of [{ evidenceQuality: "mixed" }, { marketEvidence: "unknown" }]) {
    const normal = evaluate(weakness);
    const popular = evaluate({ ...weakness, followers: 100000000, engagementRate: 99 });
    assert.equal(popular.decisionClass, "hold");
    assert.deepEqual(popular.reasons, normal.reasons);
    assert.equal(getAllocation(brandBrief, [popular.creator]).committedInr, 0);
  }
});
counterfactual("No defensible creator allows 100% held budget", () => {
  const samples = [
    { ...control, id: "weak", evidenceQuality: "mixed" },
    { ...control, id: "expensive", feeInr: 60000 }
  ];
  const result = compareSelections(brandBrief, samples);
  assert.deepEqual(result.allocation.selected, []);
  assert.equal(result.allocation.committedInr, 0);
  assert.equal(result.allocation.holdInr, brandBrief.totalBudgetInr);
  assert.equal(result.materiallyDifferent, true);
});
counterfactual("selection comparison ignores identities, input order, and ranking-only changes", () => {
  const renamed = creators.map((creator, i) => ({ ...creator, id: `new-${i}`, code: `NEW-${i}` })).reverse();
  assert.equal(compareSelections(brandBrief, renamed).materiallyDifferent, true);
  const sameSet = [{ ...control, id: "low", followers: 100, feeInr: 8000 },
    { ...control, id: "high", followers: 100000, feeInr: 16000 }];
  const agreement = compareSelections(brandBrief, sameSet);
  assert.equal(agreement.baseline[0].creator.id, "high");
  assert.equal(agreement.allocation.selected[0].creator.id, "low");
  assert.equal(agreement.materiallyDifferent, false);
  assert.equal(compareSelections(brandBrief, [...sameSet].reverse()).materiallyDifferent, false);
  assert.equal(compareSelections(brandBrief, []).materiallyDifferent, false);
});
counterfactual("selection comparison permits different selection with zero held budget", () => {
  const samples = [0, 1, 2].map((i) => ({ ...control, id: `full-${i}`, feeInr: 32000 }));
  const result = compareSelections({ ...brandBrief, totalBudgetInr: 96000 }, samples);
  assert.equal(result.allocation.holdInr, 0);
  assert.equal(result.materiallyDifferent, true);
});
counterfactual("Allocation respects budget when several creators qualify", () => {
  const samples = [0, 1, 2, 3].map((i) => ({ ...control, id: `budget-${i}`, feeInr: 32000 }));
  const result = getAllocation(brandBrief, samples);
  assert.equal(result.committedInr, 96000);
  assert.equal(result.holdInr, 4000);
  assert.equal(result.deferred.length, 1);
  assert.match(result.deferred[0].allocationReason, /remaining budget/);
  assert.deepEqual(getAllocation(brandBrief, [...samples].reverse()), result);
});
for (const name of ["engine.js", "fixtures.js", "app.js"]) {
  assert.equal(readFileSync(new URL(`../dist/${name}`, import.meta.url), "utf8"),
    readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8"), `Stale dist/${name}`);
}
console.table(cases);
pass("selection comparison", "Creator-agnostic membership comparison, agreement controls, and nine counterfactual groups pass.");

assert.doesNotMatch(uiSurface, /<form|<input|fetch\(|oauthUrl|checkout|razorpay|stripe/i);
assert.match(uiSurface, /private audience signals are simulated/i);
assert.match(uiSurface, /not an ROI prediction system/i);
assert.match(uiSurface, /not been validated through live campaigns/i);

console.table(qa);
console.log("\nProduct QA: PASS");

// Scan the complete shipped surface, including data strings rendered at runtime.
const shipped = [html, ...["app.js", "engine.js", "fixtures.js"].map(name =>
  readFileSync(new URL(`../dist/${name}`, import.meta.url), "utf8"))].join("\n");
assert.doesNotMatch(shipped, /portfolio|pb[-_]?\d{3}|P-0[1-8]|QAF-\d+|Gate\s*\d|PM judgment|proof boundary|learning[ /-](project|prototype|build)/i);
assert.match(html, /<title>Influencer Investment Engine<\/title>/);
console.log("Shipped presentation checks: PASS");
