# V2 Batch 1: enquiry handoff and story carousel

Date: 2026-11-11 (Asia/Calcutta). Implementation and verification were completed locally. The owner subsequently authorized committing and pushing Batch 1 with a descriptive commit message. The commit includes `[skip netlify]` because deployment remains pending separate authorization.

## Changes

- Preserved the four enquiry steps, validation, editable summary, back navigation and copying fallback. The existing message includes class, selected learning concern and the optional learning goal, with paragraph breaks and URL encoding. Parents must press Send in WhatsApp; opening it never reports an enquiry submission or delivery.
- Retained the settings-to-build-to-browser configuration path: `content/v2-settings.json` is validated by `src/v2-settings.mjs` and emitted as `site-settings.js`. In the follow-up the owner supplied and approved **8830499339**, normalized to **918830499339**. The number was visually verified in the contact lines of both `media/vardhaman/brand/legacy-brand-poster-img-01.jpeg` and `legacy-results-poster-img-02.jpeg`. The live page and its deployed settings exposed no number when checked; the owner selected this number rather than the other flyer contact.
- The final step now shows a disabled WhatsApp button when no approved destination is available, with an associated explanation. Earlier steps keep the action hidden and disabled. Private review also refuses a handoff if stale runtime data contains a number. Direct event dispatch cannot open a stale draft while editing.
- Fixed the story carousel's competing horizontal offsets. Keyboard focus previously changed native `scrollLeft` without updating the transform/index; Next then added another offset and could leave an almost blank viewport. Focus now selects a group containing the card, native horizontal scrolling is cleared, and resizing preserves a focused card's visibility. Existing card geometry, transitions, content, filters and dialogs are retained.
- Added a scoped disabled-button style and browser regressions in `tests/production-browser/enquiry.spec.mjs` and `tests/production-browser/stories.spec.mjs`.
- Recorded the owner's follow-up approval of all supplied images/videos, explicit rights/guardian-consent confirmation (including voices, posters and projected results), and IMG-18/19 award provenance. All 21 V2 records are approved; the existing display plan packages 18 media files and 10 gallery cards (5 photos and 5 videos). IMG-01/02/09 remain unused archive references. No source image/video was edited, and captions do not invent award details or turn legacy offers into current claims.

## Verification

The focused missing-contact and keyboard-carousel tests failed against the original implementation before the fixes. Both fictional contact fixtures and the generated artifact's actual configured contact are tested with all WhatsApp requests intercepted before contacting the service or academy. Analytics requests are stubbed. The copied-message comparison normalizes Windows clipboard line endings. Negative media fixtures explicitly reset verification/missing-source fields instead of depending on the old pending production states; HTTP checks now cover MP4 MIME types and byte ranges as well as images.

| Check | Result |
| --- | --- |
| `npm.cmd run check` | Pass |
| `npm.cmd test` | 19/19 passed |
| `npm.cmd run build` and `npm.cmd run verify:production` | Pass: 35 files, 18 approved media files, 10 gallery entries, 31,347,587 bytes |
| `npm.cmd run test:browser:production -- --output=test-results-production/batch1-approved` | 37/37 passed: 27 Chrome and 10 Edge |
| `npm.cmd run test:browser:v2 -- --output=test-results-v2/batch1-approved` | 12/12 passed |
| `npm.cmd run test:browser -- --output=test-results/batch1-approved` | 8/8 passed |
| Additional final-step layout check | Initial missing-contact state: 1440/390/320px. Follow-up configured state: 1440/390px with enabled WhatsApp and ten gallery cards. No horizontal overflow. |
| Preservation | All 21 source media files, package files and Netlify configuration match HEAD bytes. Settings/manifest approvals changed only as authorized in the follow-up. |

All **76 automated tests passed** after the contact/media follow-up: 19 contract/settings/build, 37 production browser, 12 private V2 browser and 8 retained V1 browser tests. Syntax, production artifact and whitespace checks also passed. The earlier null-contact/empty-gallery Batch 1 run passed 70 tests before these additional approvals and checks.

Enquiry regressions cover the actual configured artifact plus approved/missing/unapproved/private fixtures, exact Unicode and special-character message round trips, no opening before review or during editing, validation, back/edit, optional empty goals, copying and truthful status text. Production gallery regressions load the actual packaged photos and decode/play all packaged videos, check filters and captions, prevent pre-click MP4 loading, and verify pause/focus return on close. Carousel regressions cover forward/reverse Tab, selected dots, Previous/Next, filters, dialog focus return and resizing at 1440/768/390/320px. The 390px carousel cases exercise normal motion; other cases retain reduced-motion coverage.

Initial missing-contact screenshots are in ignored `qa/visual/batch1/`. Current approved-contact/gallery captures are in `qa/visual/batch1-approved/enquiry-1440.png`, `enquiry-390.png`, `gallery-1440.png` and `gallery-390.png`. The latter section captures hide sticky overlays only for the screenshot; application layout and actual navigation/CTA behavior remain unchanged and are covered by the browser suites.

## Remaining blockers and limits

- Actual WhatsApp receipt still requires an owner check; no message was sent during automated tests.
- VID-04 retains its disclosed sideways ending. Audio review/captions/transcripts, verified stories/remaining factual copy, and launch/indexing decisions remain outstanding. No indexing or deployment settings changed.
- Installed desktop Chrome and Edge with emulated viewport sizes were tested. Physical devices, Safari/iOS, Firefox and manual screen-reader review remain outstanding.
- The earlier production-only Netlify toolbar/CSP conflict and media performance work were not changed in this batch.
