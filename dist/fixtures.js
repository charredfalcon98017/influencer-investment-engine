export const brandBrief = Object.freeze({
  id: "demo-india-plant-protein",
  product: "India-only plant protein",
  market: "India",
  target: "Age 20-35, fitness/health, vegetarian or vegan affinity",
  objective: "Incremental first-time purchases",
  sellingPriceInr: 1999,
  contributionMarginInr: 800,
  totalBudgetInr: 100000,
  positioning:
    "Premium plant protein for fitness-conscious vegetarian and vegan customers in India.",
  provenance: [
    {
      label: "Scenario",
      source: "SYNTHETIC_SCENARIO",
      note: "Illustrative India-only plant protein scenario; no live brand or campaign data."
    },
    {
      label: "Economics",
      source: "SYNTHETIC_FIXTURE",
      note: "Selling price, margin, and budget are fixed test inputs, not market validation."
    }
  ]
});

export const creators = Object.freeze([
  {
    id: "creator-a",
    code: "A",
    name: "Fitness Star",
    feeInr: 55000,
    followers: 520000,
    engagementRate: 4.8,
    contentFit: "strong",
    contentFitLabel: "Strong fitness; mixed supplements",
    marketEvidence: "unknown",
    marketEvidenceLabel: "UNKNOWN - no verified geography",
    buyerFit: "medium",
    buyerFitLabel: "Medium",
    evidenceQuality: "mixed",
    evidenceQualityLabel: "Mixed / critical geography missing",
    fixtureProvenance:
      "Synthetic creator fixture. Unknown India audience share is intentionally preserved rather than fabricated.",
    publicSignals: [
      "Large public reach",
      "Strong visible engagement",
      "Fitness relevance is clear from public content"
    ],
    missingEvidence: [
      "Verified Indian audience share",
      "Evidence that a meaningful audience segment can buy an India-only product"
    ]
  },
  {
    id: "creator-b",
    code: "B",
    name: "Indian Strength Coach",
    feeInr: 32000,
    followers: 145000,
    engagementRate: 4.1,
    contentFit: "strong",
    contentFitLabel: "Strong strength/nutrition/protein",
    marketEvidence: "strong",
    marketEvidenceLabel: "STRONG - simulated media-kit geography",
    buyerFit: "strong",
    buyerFitLabel: "Strong",
    evidenceQuality: "strong",
    evidenceQualityLabel: "Strong / simulated verified evidence",
    fixtureProvenance:
      "Synthetic creator fixture. Verified geography is an explicit fixture assumption, not a live platform claim.",
    publicSignals: [
      "Clear Indian market orientation",
      "Strength and nutrition content",
      "Simulated geography from an illustrative media kit"
    ],
    missingEvidence: []
  },
  {
    id: "creator-c",
    code: "C",
    name: "Viral Gym Creator",
    feeInr: 22000,
    followers: 310000,
    engagementRate: 7.2,
    contentFit: "medium",
    contentFitLabel: "Gym entertainment; weak nutrition depth",
    marketEvidence: "medium",
    marketEvidenceLabel: "MEDIUM - public India-oriented content, no verified audience split",
    buyerFit: "weak-medium",
    buyerFitLabel: "Weak-Medium",
    evidenceQuality: "moderate",
    evidenceQualityLabel: "Moderate",
    fixtureProvenance:
      "Synthetic creator fixture. High engagement is not treated as purchase-intent evidence.",
    publicSignals: [
      "Highest engagement rate in the fixture",
      "Substantial public reach",
      "India-oriented public content"
    ],
    missingEvidence: [
      "Verified audience geography",
      "Evidence of premium plant-protein purchase intent"
    ]
  },
  {
    id: "creator-d",
    code: "D",
    name: "Plant Fitness Educator",
    feeInr: 16000,
    followers: 62000,
    engagementRate: 3.6,
    contentFit: "very-strong",
    contentFitLabel: "Very strong plant nutrition + fitness",
    marketEvidence: "medium",
    marketEvidenceLabel: "MEDIUM - India-oriented content, no private demographic verification",
    buyerFit: "strong",
    buyerFitLabel: "Strong",
    evidenceQuality: "moderate",
    evidenceQualityLabel: "Moderate",
    fixtureProvenance:
      "Synthetic creator fixture. Moderate geography confidence is kept visible in the verdict.",
    publicSignals: [
      "Highly specific plant nutrition fit",
      "Clear fitness education angle",
      "Low capital exposure"
    ],
    missingEvidence: ["Privately verified audience geography"]
  }
]);

