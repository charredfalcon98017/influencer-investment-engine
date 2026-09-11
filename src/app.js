import { brandBrief, creators } from "./fixtures.js";
import {
  formatInr,
  getAllocation,
  getBaselineRanking,
  getDecisionResults,
  compareSelections
} from "./engine.js";

const state = {
  screen: "brief",
  selectedCreatorId: "creator-b"
};

const screens = [
  ["brief", "Brief"],
  ["compare", "Compare"],
  ["decision", "Decision"],
  ["allocation", "Allocation"]
];

const results = getDecisionResults(brandBrief, creators);
const allocation = getAllocation(brandBrief, creators);
const comparison = compareSelections(brandBrief, creators);
const baseline = getBaselineRanking(creators);

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function byId(id) {
  return document.getElementById(id);
}

function renderShell() {
  const nav = byId("screen-nav");
  nav.innerHTML = "";
  screens.forEach(([id, label]) => {
    const button = el("button", state.screen === id ? "nav-pill active" : "nav-pill");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-pressed", String(state.screen === id));
    button.addEventListener("click", () => {
      state.screen = id;
      render();
    });
    nav.append(button);
  });
}

function metric(label, value, detail) {
  const node = el("div", "metric");
  node.append(el("span", "metric-label", label));
  node.append(el("strong", "", value));
  if (detail) node.append(el("small", "", detail));
  return node;
}

function provenanceList(items) {
  const list = el("ul", "provenance-list");
  items.forEach((item) => {
    const li = el("li");
    li.innerHTML = `<strong>${item.label}</strong><span>${item.source}</span><p>${item.note}</p>`;
    list.append(li);
  });
  return list;
}

function renderBrief() {
  const main = el("section", "screen brief-screen");
  const header = el("div", "screen-header");
  header.append(el("p", "eyebrow", "Pre-spend decision support"));
  header.append(el("h1", "", "Influencer Investment Engine"));
  header.append(
    el(
      "p",
      "lede",
      "Evaluate influencer investments using unit economics, audience evidence, product fit, and explicit uncertainty before committing campaign budget."
    )
  );

  const grid = el("div", "metric-grid");
  grid.append(metric("Budget", formatInr(brandBrief.totalBudgetInr), "Do not force spend"));
  grid.append(metric("Contribution margin", formatInr(brandBrief.contributionMarginInr), "Per incremental order"));
  grid.append(metric("Market", brandBrief.market, "India-only product"));
  grid.append(metric("Objective", "First-time orders", "Pre-spend decision"));

  const panel = el("div", "panel two-col");
  const left = el("div");
  left.append(el("h2", "", "Brand investment brief"));
  const facts = el("dl", "fact-list");
  [
    ["Product", brandBrief.product],
    ["Target", brandBrief.target],
    ["Objective", brandBrief.objective],
    ["Positioning", brandBrief.positioning]
  ].forEach(([term, description]) => {
    facts.append(el("dt", "", term));
    facts.append(el("dd", "", description));
  });
  left.append(facts);

  const right = el("div");
  right.append(el("h2", "", "About this demo"));
  const boundary = el("ul", "check-list");
  [
    "Demo data is illustrative. Creator profiles and private audience signals are synthetic or simulated.",
    "Review economics, evidence quality, uncertainty, and transparent decision rules.",
    "This prototype has not been validated through live campaigns and is not an ROI prediction system."
  ].forEach((item) => boundary.append(el("li", "", item)));
  right.append(boundary);

  panel.append(left, right);
  main.append(header, grid, panel, provenanceList(brandBrief.provenance));
  return main;
}

function renderCompare() {
  const main = el("section", "screen");
  main.append(el("p", "eyebrow", "Screen 2 / Creator evidence"));
  main.append(el("h1", "", "Reach ranking vs investment assessment"));
  main.append(
    el(
      "p",
      "lede",
      "The baseline shortlists the top two by followers, using engagement to break ties. The investment assessment also asks whether the spend can clear a deterministic economic hurdle with evidence strong enough for the decision."
    )
  );

  const wrap = el("div", "comparison-layout");
  const baselinePanel = el("div", "panel");
  baselinePanel.append(el("h2", "", "Baseline ranking"));
  const baselineList = el("ol", "rank-list");
  baseline.forEach((item) => {
    const li = el("li");
    li.innerHTML = `<strong>${item.creator.code} - ${item.creator.name}</strong><span>${item.creator.engagementRate}% engagement / ${new Intl.NumberFormat("en-IN").format(item.creator.followers)} followers</span>`;
    baselineList.append(li);
  });
  baselinePanel.append(baselineList);

  const decisionPanel = el("div", "panel creator-table-panel");
  decisionPanel.append(el("h2", "", "Investment assessment"));
  const table = el("table", "creator-table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Creator</th>
        <th>Fee</th>
        <th>Break-even</th>
        <th>Evidence</th>
        <th>Verdict</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  results.forEach((result) => {
    const row = document.createElement("tr");
    row.className = result.creator.id === state.selectedCreatorId ? "selected" : "";
    row.innerHTML = `
      <td><button class="link-button" type="button">${result.creator.code} - ${result.creator.name}</button></td>
      <td>${formatInr(result.creator.feeInr)}</td>
      <td>${result.breakEvenOrders} orders</td>
      <td>${result.creator.evidenceQualityLabel}</td>
      <td><span class="status ${result.decisionClass}">${result.verdict}</span></td>
    `;
    row.querySelector("button").addEventListener("click", () => {
      state.selectedCreatorId = result.creator.id;
      state.screen = "decision";
      render();
    });
    tbody.append(row);
  });
  decisionPanel.append(table);
  wrap.append(baselinePanel, decisionPanel);
  main.append(wrap);
  return main;
}

function renderDecision() {
  const selected =
    results.find((result) => result.creator.id === state.selectedCreatorId) ||
    results[0];
  const main = el("section", "screen");
  main.append(el("p", "eyebrow", "Screen 3 / Verdict and uncertainty"));
  main.append(el("h1", "", `${selected.creator.code} - ${selected.creator.name}`));

  const chooser = el("div", "creator-switcher");
  results.forEach((result) => {
    const button = el(
      "button",
      result.creator.id === selected.creator.id ? "chip active" : "chip",
      result.creator.code
    );
    button.type = "button";
    button.title = result.creator.name;
    button.addEventListener("click", () => {
      state.selectedCreatorId = result.creator.id;
      render();
    });
    chooser.append(button);
  });

  const decisionGrid = el("div", "decision-grid");
  const verdict = el("div", `verdict-card ${selected.decisionClass}`);
  verdict.append(el("span", "metric-label", "Verdict"));
  verdict.append(el("strong", "", selected.verdict));
  verdict.append(
    el(
      "p",
      "",
      selected.reasons[0] ||
        "The engine only issues decisions supported by economics and evidence."
    )
  );

  const math = el("div", "panel");
  math.append(el("h2", "", "Economic threshold"));
  math.append(
    metric(
      "Break-even hurdle",
      `${selected.breakEvenOrders} incremental orders`,
      `${formatInr(selected.creator.feeInr)} fee / ${formatInr(
        brandBrief.contributionMarginInr
      )} margin`
    )
  );
  math.append(
    metric(
      "Budget exposure",
      `${Math.round(selected.budgetShare * 100)}%`,
      `${formatInr(selected.creator.feeInr)} of ${formatInr(
        brandBrief.totalBudgetInr
      )}`
    )
  );

  const evidence = el("div", "panel");
  evidence.append(el("h2", "", "Evidence and provenance"));
  const facts = el("dl", "fact-list compact");
  [
    ["Content fit", selected.creator.contentFitLabel],
    ["India-audience evidence", selected.creator.marketEvidenceLabel],
    ["Buyer-fit evidence", selected.creator.buyerFitLabel],
    ["Evidence quality", selected.creator.evidenceQualityLabel],
    ["Provenance", selected.creator.fixtureProvenance]
  ].forEach(([term, description]) => {
    facts.append(el("dt", "", term));
    facts.append(el("dd", "", description));
  });
  evidence.append(facts);

  const uncertainty = el("div", "panel");
  uncertainty.append(el("h2", "", "Decision-critical uncertainty"));
  const riskList = el("ul", "check-list risk");
  const riskItems =
    selected.riskFlags.length > 0
      ? selected.riskFlags
      : ["No decision-critical missing evidence in this fixture."];
  riskItems.forEach((item) => riskList.append(el("li", "", item)));
  selected.conditions.forEach((item) => riskList.append(el("li", "", item)));
  uncertainty.append(riskList);

  decisionGrid.append(verdict, math, evidence, uncertainty);
  main.append(chooser, decisionGrid);
  return main;
}

function renderAllocation() {
  const main = el("section", "screen");
  main.append(el("p", "eyebrow", "Screen 4 / Comparative allocation"));
  main.append(el("h1", "", `Spend ${formatInr(allocation.committedInr)}, hold ${formatInr(allocation.holdInr)}`));
  main.append(
    el(
      "p",
      "lede",
      "The allocation follows the economic and evidence rules. Holding the entire budget is valid when no creator qualifies."
    )
  );

  const summary = el("div", "allocation-summary");
  summary.append(metric("Recommended spend", formatInr(allocation.committedInr), allocation.selected.map((item) => `${item.creator.code}${item.decisionClass === "conditional" ? " (conditional)" : ""}`).join(" + ") || "No qualifying creators"));
  summary.append(metric("Hold", formatInr(allocation.holdInr), "Pending verified evidence"));
  summary.append(metric("Selection vs baseline", comparison.materiallyDifferent ? "Different" : "Same selection", comparison.caveat));

  const allocationPanel = el("div", "panel");
  allocationPanel.append(el("h2", "", "Allocation plan"));
  const plan = el("div", "allocation-bars");
  allocation.selected.forEach((result) => {
    const row = el("div", "bar-row");
    row.innerHTML = `
      <div><strong>${result.creator.code} - ${result.creator.name}</strong><span>${result.verdict}</span></div>
      <div class="bar"><span style="width:${Math.round(
        result.budgetShare * 100
      )}%"></span></div>
      <strong>${formatInr(result.creator.feeInr)}</strong>
    `;
    plan.append(row);
  });
  const hold = el("div", "bar-row hold-row");
  hold.innerHTML = `
    <div><strong>Hold budget</strong><span>Do not force weak spend</span></div>
    <div class="bar"><span style="width:${Math.round(
      allocation.holdInr / allocation.totalBudgetInr * 100
    )}%"></span></div>
    <strong>${formatInr(allocation.holdInr)}</strong>
  `;
  plan.append(hold);
  allocationPanel.append(plan);
  allocation.deferred.forEach((result) => {
    allocationPanel.append(el("p", "", `${result.creator.code}: ${result.allocationReason}`));
  });

  const caveat = el("div", "panel caveat");
  caveat.append(el("h2", "", "Product limitations"));
  caveat.append(
    el(
      "p",
      "",
      "Demo data is illustrative and synthetic; private audience signals are simulated. Selection differences reflect the stated rules, not proven campaign performance."
    )
  );
  caveat.append(
    el(
      "p",
      "",
      "This prototype has not been validated through live campaigns and is not an ROI prediction system."
    )
  );

  main.append(summary, allocationPanel, caveat);
  return main;
}

function render() {
  renderShell();
  const root = byId("screen-root");
  root.innerHTML = "";
  const map = {
    brief: renderBrief,
    compare: renderCompare,
    decision: renderDecision,
    allocation: renderAllocation
  };
  root.append(map[state.screen]());
}

render();
