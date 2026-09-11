# Influencer Investment Engine

Evaluate influencer investments using unit economics, audience evidence, product fit, and explicit uncertainty before committing campaign budget.

## Who it is for

Small direct-to-consumer brands and marketers deciding how to allocate a limited influencer budget. Reach and engagement alone cannot establish whether a creator reaches eligible buyers or whether a fee is economically defensible.

## How it works

The interactive demo follows four steps:

1. **Brief:** review the product, target audience, budget, and contribution margin.
2. **Compare:** compare a reach-based ranking with an evidence-based investment assessment.
3. **Decision:** inspect each creator’s break-even hurdle, evidence quality, missing information, verdict, and conditions.
4. **Allocation:** review recommended spending and the budget held pending stronger evidence.

The included India-only plant protein scenario uses a ₹1,00,000 budget, ₹800 contribution margin, and four synthetic creators. It allocates ₹32,000 to B and a conditional ₹16,000 test to D, holding ₹52,000. See the [demo walkthrough](docs/demo-script.md).

## Decision model

Break-even orders = `ceil(creator fee / contribution margin per incremental order)`. This is the number of incremental orders needed to cover the creator fee, not a sales forecast.

Unknown geography or insufficient evidence blocks spending. Investment requires strong market evidence, evidence quality and buyer fit, strong content fit, and at most 45 break-even orders. A conditional test requires very strong content fit, strong buyer fit, at least medium market evidence and moderate evidence quality, at most 25 break-even orders, and at most 20% budget exposure. Rules apply in order; see the [full methodology](docs/methodology.md).

Allocation prioritizes investment before conditional tests, then lower break-even orders, with creator ID as a stable tie-breaker. Fees exceeding remaining budget are deferred. Holding the entire budget is valid. These thresholds are prototype policy assumptions, not empirically calibrated predictions; the allocation heuristic does not claim mathematical optimality.

## Data provenance and limitations

- Demo data is illustrative and synthetic, including creator identities, fees, followers, engagement, brand economics, and fit assessments.
- Private audience signals and media-kit verification are simulated where shown. No live platform data or private analytics are accessed. Unknown geography stays explicitly unknown.
- This prototype has not been validated through live campaigns and is not an ROI prediction system. A different shortlist does not establish better campaign outcomes.
- The demo uses a fixed scenario, without input editing, creator discovery, accounts, campaign execution, payments, or live integrations.
- The engine assumes unique creator IDs, positive finite budget and margin, and nonnegative finite fees. It is not hardened for arbitrary external input or production use.

## Run locally

Requires Python 3 to serve the static app; Node.js 18+ and npm to run checks. No dependencies need installing.

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open [the local demo](http://127.0.0.1:8765). ES modules require HTTP; opening the HTML file directly is unsupported.

```sh
npm run check
npm run qa
```

## Technical notes

Vanilla JavaScript ES modules and CSS, with no backend or build dependencies. `src/engine.js` contains the decision rules, `src/fixtures.js` the sample data, and `src/app.js` the four-screen interface. `dist/` is the runnable static app.

After editing source JavaScript, copy the changed files into `dist/`. QA checks exact source/distribution parity as well as scenario and counterfactual behavior. See [testing](docs/product-qa.md).
