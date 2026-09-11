# Decision methodology

The following are prototype policy assumptions, not empirically calibrated thresholds or predicted conversions:

1. Unknown/missing market evidence → HOLD / VERIFY FIRST at any fee or reach.
2. Mixed, missing, or unrecognized evidence quality → HOLD / VERIFY FIRST.
3. INVEST requires strong market evidence, strong evidence quality, strong buyer fit, strong/very-strong content fit, and at most 45 break-even orders.
4. Otherwise, CONDITIONAL TEST requires strong/medium market evidence, strong/moderate evidence quality, strong buyer fit, very-strong content fit, at most 25 break-even orders, and at most 20% of budget. Verify geography and evidence reliability before scaling.
5. Moderate evidence with otherwise strong buyer/content fit that misses the test rules → HOLD pending stronger support and a fresh economic assessment. Other combinations → DO NOT PRIORITIZE with a reason.

Break-even remains ceil(fee / contribution margin); it says how many incremental orders would cover the fee, not how many will occur. Conditions and evidence quality are visible on the decision screen. Verification alone cannot guarantee investment if other requirements fail.

Allocation considers INVEST before CONDITIONAL TEST, then lower break-even orders, then stable creator ID for ties; it defers any fee that exceeds remaining budget. This is a transparent heuristic, not an optimal allocation claim. No eligible creators means zero spend and 100% held budget. Input contract remains synthetic fixtures with unique IDs, positive finite margin/budget and nonnegative finite fees; arbitrary external input validation is outside this prototype.


The reach baseline selects the top two creators by followers, breaking ties by engagement. The comparison checks funded-set membership, not rank order. Agreement is valid. Selection differences do not establish superior outcomes.
