# Release 1.1 packaging verification

Scope: layperson-first README, actual app media and static-demo access. No decision-engine, fixture or application JavaScript changes. One CSS presentation defect was found during capture: at 1440px, Compare’s two-column layout concealed the verdict column behind horizontal scrolling. Stacking the ranking above the table now exposes all verdicts at that width. Narrow screens retain table scrolling.

## Cold-reader review

PASS in an author-performed cold-review simulation, not an independent user study or a measured comprehension experiment. The opening story before the first screenshot supplies the following in roughly one minute of reading:

| Reader question | Visible answer |
| --- | --- |
| Who uses this? | Small D2C brand / influencer-budget decision maker |
| What is the problem? | Limited money; popularity cannot establish eligible buyers or justify fees |
| What is the scenario? | India-only plant protein; ₹1,00,000 budget; ₹800 contribution per extra order |
| Why does vanity ranking fail? | A’s geography is unknown; C’s engagement does not establish buying interest |
| What changes? | Economics and evidence produce explained invest/test/hold decisions |
| What is the outcome? | ₹32,000 B + conditional ₹16,000 D + ₹52,000 held, stated near the top |
| What are the limitations? | Synthetic data, simulated private signals, fixed demo, no live validation or ROI prediction |
| How can I see it? | Prominent live-demo and actual-recording links, plus local setup |

## Verification

- `npm run check`: PASS.
- `npm run qa`: PASS, including nine counterfactual groups, scenario results and source/distribution parity.
- `npm run qa:packaging`: verifies all relative README targets, physical media signatures, hashes and sizes, five screenshots plus cover, 60–90-second duration metadata, opening story elements and public-language boundaries.
- Actual browser capture: no page errors. All four screens exercised; A, B and D decisions inspected.
- All still images visually inspected for readability and correct values. The corrected Compare screenshot exposes all verdicts. Video duration is 86.48 seconds; playback is checked separately from file existence.
- README rendered and visually reviewed, including image loading and the opening story. No claim of external reader validation.

## Deployment

GitHub Pages serves the existing repository as static files, with `.nojekyll` and a root entry linking to `dist/`. No backend, third-party hosting account, application dependency or second repository is required. The hosted URL must be checked after publication; a README link alone is not deployment evidence.

Media details: [manifest and playback notes](../assets/media/README.md).
