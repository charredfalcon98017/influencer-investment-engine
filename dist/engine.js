const CONTENT_FIT_POINTS = {
  "very-strong": 4,
  strong: 3,
  medium: 2,
  "weak-medium": 1
};

export function formatInr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function evaluateCreator(brandBrief, creator) {
  const breakEvenOrders = Math.ceil(
    creator.feeInr / brandBrief.contributionMarginInr
  );
  const budgetShare = creator.feeInr / brandBrief.totalBudgetInr;
  const fitScore = CONTENT_FIT_POINTS[creator.contentFit];

  const reasons = [];
  const conditions = [];
  let verdict = "DO NOT PRIORITIZE";
  let decisionClass = "avoid";

  if (!["strong", "medium"].includes(creator.marketEvidence)) {
    verdict = "HOLD / VERIFY FIRST";
    decisionClass = "hold";
    reasons.push(
      `${formatInr(creator.feeInr)} consumes ${Math.round(
        budgetShare * 100
      )}% of budget while India-audience evidence is unknown.`
    );
    conditions.push("Verify meaningful Indian audience share before committing.");
  } else if (!["strong", "moderate"].includes(creator.evidenceQuality)) {
    verdict = "HOLD / VERIFY FIRST";
    decisionClass = "hold";
    reasons.push("Mixed or unknown evidence quality cannot support a spending decision, regardless of reach.");
    conditions.push("Verify the source and reliability of the supporting evidence before committing.");
  } else if (
    creator.marketEvidence === "strong" &&
    creator.evidenceQuality === "strong" &&
    creator.buyerFit === "strong" &&
    fitScore >= 3 &&
    breakEvenOrders <= 45
  ) {
    verdict = "INVEST";
    decisionClass = "invest";
    reasons.push(
      `Requires ${breakEvenOrders} incremental orders with strong market, buyer-fit, and evidence-quality support.`
    );
  } else if (
    fitScore >= 4 &&
    creator.buyerFit === "strong" &&
    ["strong", "medium"].includes(creator.marketEvidence) &&
    budgetShare <= 0.2 &&
    breakEvenOrders <= 25
  ) {
    verdict = "CONDITIONAL TEST";
    decisionClass = "conditional";
    reasons.push(
      `Only ${breakEvenOrders} incremental orders are needed, and product fit is unusually specific; evidence supports only a limited test.`
    );
    conditions.push("Cap this test at 20% of budget; verify audience geography and evidence reliability before scaling.");
  } else if (creator.evidenceQuality === "moderate" && creator.buyerFit === "strong" && fitScore >= 3) {
    verdict = "HOLD / VERIFY FIRST";
    decisionClass = "hold";
    reasons.push("Moderate evidence quality is insufficient for investment and this creator does not meet the limited-test rules.");
    conditions.push("Obtain strong supporting evidence, then reassess economics; verification does not guarantee investment.");
  } else if (creator.buyerFit === "weak-medium" || fitScore <= 2) {
    verdict = "DO NOT PRIORITIZE";
    decisionClass = "avoid";
    reasons.push(
      "Public engagement is not enough evidence of premium plant-protein purchase intent."
    );
  } else {
    reasons.push(`The ${breakEvenOrders}-order hurdle or fit does not meet the investment or limited-test rules.`);
  }

  if (creator.missingEvidence.length > 0) {
    reasons.push(`Missing evidence: ${creator.missingEvidence.join("; ")}.`);
  }

  return {
    creator,
    breakEvenOrders,
    budgetShare,
    fitScore,
    verdict,
    decisionClass,
    reasons,
    conditions,
    riskFlags: creator.missingEvidence
  };
}

export function getBaselineRanking(creators) {
  return creators
    .slice()
    .sort((a, b) => {
      const reachDelta = b.followers - a.followers;
      if (reachDelta !== 0) return reachDelta;
      return b.engagementRate - a.engagementRate;
    })
    .map((creator, index) => ({ creator, rank: index + 1 }));
}

export function getDecisionResults(brandBrief, creators) {
  return creators
    .map((creator) => evaluateCreator(brandBrief, creator))
    .sort((a, b) => {
      const order = { invest: 0, conditional: 1, hold: 2, avoid: 3 };
      const classDelta = order[a.decisionClass] - order[b.decisionClass];
      if (classDelta !== 0) return classDelta;
      return a.breakEvenOrders - b.breakEvenOrders || a.creator.id.localeCompare(b.creator.id);
    });
}

export function getAllocation(brandBrief, creators) {
  const eligible = getDecisionResults(brandBrief, creators).filter((result) =>
    ["invest", "conditional"].includes(result.decisionClass)
  );
  const selected = [];
  const deferred = [];
  let committedInr = 0;
  for (const result of eligible) {
    if (committedInr + result.creator.feeInr <= brandBrief.totalBudgetInr) {
      selected.push(result);
      committedInr += result.creator.feeInr;
    } else {
      deferred.push({ ...result, allocationReason: "Fee exceeds remaining budget; defer rather than overspend." });
    }
  }
  const holdInr = brandBrief.totalBudgetInr - committedInr;

  return {
    selected,
    deferred,
    holdInr,
    committedInr,
    totalBudgetInr: brandBrief.totalBudgetInr,
    statement:
      "Spend only where economics and evidence are defensible; hold the rest instead of forcing allocation."
  };
}

export function compareSelections(brandBrief, creators) {
  const baseline = getBaselineRanking(creators);
  const decisions = getDecisionResults(brandBrief, creators);
  const allocation = getAllocation(brandBrief, creators);
  // Compare membership, not presentation order or fixture names. Agreement is valid.
  const baselineIds = new Set(baseline.slice(0, 2).map((item) => item.creator.id));
  const selectedIds = new Set(allocation.selected.map((item) => item.creator.id));
  const materiallyDifferent = baselineIds.size !== selectedIds.size ||
    [...baselineIds].some((id) => !selectedIds.has(id));

  return {
    baseline,
    decisions,
    allocation,
    materiallyDifferent,
    caveat:
      "Selection differences in synthetic demo data do not establish better campaign outcomes."
  };
}
