# Testing

Run `npm run check` for JavaScript syntax and `npm run qa` for behavioral regression checks.

The suite checks the demo brief, synthetic provenance, break-even calculations, evidence-dependent verdicts, visible uncertainty, allocation, and selection comparison. Nine counterfactual groups vary evidence quality, fee, geography, margin, reach, full-budget hold, identity and input order, full spend, and budget constraints. Source and served JavaScript must match exactly.

The fixed scenario expects B to receive INVEST, D CONDITIONAL TEST, A HOLD / VERIFY FIRST, and C DO NOT PRIORITIZE, with ₹48,000 committed and ₹52,000 held. These are deterministic regression expectations for synthetic data, not campaign validation.
