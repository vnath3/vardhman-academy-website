# V2 production-readiness refinement

Verified locally on 2026-11-01. The existing V2 design and repository are retained. No commit, push, deployment, indexing activation or media approval was performed. The live site remains unchanged by this work. The local artifact passes verification; final launch remains blocked by the owner decisions below.

## Inspection findings

- The live page served V2 with the approved branding, portrait and seminar photo. Its four-step enquiry wizard only copied a draft; no approved WhatsApp destination was configured.
- Canonical, Open Graph and favicon metadata were missing. Noindex was already enabled and remains enabled.
- The gallery was empty because no gallery photo, video or poster had individual public approval. This was intentional exclusion, not an asset-path failure.
- The source/build used the existing approval manifest correctly. Its 21 records remain unchanged: 3 approved, 15 pending and 3 rejected. All supplied originals remain available in the private local preview.
- Accessibility checks exposed dialog focus leakage and text contrast failures. Expanded checks also found quiz feedback/result contrast and invalid progress-dot labelling. Visual review found a later desktop CSS rule overriding the mentor section's mobile stacking rule.

## Implemented refinements

- Retained all four enquiry steps. Added a validated, owner-managed WhatsApp setting, clear text-only summary, back/edit/copy, explicit Open WhatsApp button and privacy/delivery wording. Drafts stay in page memory; no automatic submission or fake success state exists. The WhatsApp URL is constructed only on the button action, keeping draft text out of outbound-link attributes and analytics events. The destination remains disabled until an approved number is supplied.
- Preserved the manifest-only gallery and filters. Both a video and its poster need individual approval. No pending/rejected media is copied to `dist/`, and no source media permission was changed. Added accessible modal load-error feedback.
- Kept illustrative story labels and made the section/modal disclaimers clearer. No actual student identity, testimonial, result or career was invented or substituted.
- Added configurable build-time title, description, canonical, Open Graph/sharing image and favicon. Sharing uses approved HERO-A; the favicon uses approved LOGO-V2. Indexing requires an explicit approval record and changes HTML robots metadata, robots.txt and Netlify headers together. Private previews always remain noindex.
- Added modal focus containment, background inertness, focus restoration, announced form feedback and accessible step progress. Adjusted contrast within the existing palette and restored the existing mobile mentor stacking rule. Other V2 layout, filters, dialogs, class selector and quiz interactions are preserved.
- Retained the requested Google tag G-4F7P27EQSF in production only. Synthetic local tests intercept Google and WhatsApp traffic.

Settings live in `content/v2-settings.json`; implementation and activation instructions are in [IMPLEMENTATION.md](IMPLEMENTATION.md). `netlify.toml` still builds/verifies V2 and publishes only `dist/`.

## Production asset result

Only **LOGO-V2, HERO-A and IMG-12** are public. IMG-12 retains the owner's prior explicit confirmation of guardian consent covering every student embedded in its projected display and its truthful external-event caption.

The verified artifact contains **20 files, 3 approved media files, 0 gallery cards and 2,962,747 bytes**. Approved bytes match the source files. All declared code, styles, fonts, icon and media paths resolve. Pending/rejected media, private catalogues and the review index are physically absent. The video/poster approval rules and revocation/stale-file removal are covered by isolated build tests; future gallery activation needs only manifest updates.

## Content audit

| Existing content | Disposition |
| --- | --- |
| Five sample journeys: aviation, medicine, engineering, confidence and design | Individually labelled sample stories; section and dialog explicitly disclaim verified alumni and promised outcomes. Replace only with verified, permissioned accounts. |
| Student voices/reviews box | Retains its explicit reserved-for-real-reviews text; no quote is presented as authentic. |
| Teaching approach and class-stage descriptions | Existing proposed/concept copy retained; actual methods and commitments require owner review. |
| Gallery empty state | Truthful permission notice retained. Filters work; no pretend public cards or videos. |
| Missing detailed address/map and admissions details | Existing explanation retained; no invented address, fees, batches, availability or contact number. |
| 500+ claim, mentor feedback summary, all-subject/all-board claims | Existing handoff copy retained; hero count attributes its source to the academy. Supporting facts and wording still need owner verification before launch. |
| Portrait/review placeholders and concept footer | Approved portrait/seminar media replaces image fallbacks at runtime; review placeholders and concept footer remain clearly labelled during prelaunch. |

## Test results

| Check | Result |
| --- | --- |
| `npm.cmd run check` | Passed JavaScript syntax checks. |
| `npm.cmd test` | 19/19 passed: existing contracts, approval/path isolation, revocation, settings/launch approval and production packaging. |
| `npm.cmd run build` and `npm.cmd run verify:production` | Passed; exact approved output and byte identity checked. |
| `npm.cmd run test:browser:production` | 17/17 passed in installed Chrome and Edge. Desktop 1440, tablet 768, mobile 390 and 320px; no horizontal overflow, failed resources, JavaScript errors or CSP violations in the resource/interactions checks. |
| `npm.cmd run test:browser:v2` | 12/12 passed. All ten private gallery cards, category filters, photo dialogs, all five MP4 decodes/playback, keyboard controls, stories, class selector, quiz, FAQ and enquiry regressions retained. |
| `npm.cmd run test:browser` | 8/8 retained V1 regressions passed. |
| Accessibility | Automated WCAG A/AA checks passed on revealed public/private content. Additional local audit passed all 14 desktop/mobile state scans: full page, story dialog, wrong/right quiz feedback, results, enquiry validation and final review. Production regressions also cover concern validation. Existing expected accessibility failures now pass as ordinary assertions. |
| WhatsApp/analytics | Fictional-number fixtures verify explicit-action-only opening, encoded summaries, edit/back, no draft in dataLayer/link attributes and truthful delivery messaging. Google initializer/CSP tested locally with intercepted requests. Actual academy delivery awaits the owner number and owner test. |

Total: **56 automated tests passed**, plus the additional local state/performance audit. Dynamic accessibility scans wait for revealed content and finite animations to settle so they measure the displayed state.

Local screenshots: [desktop](../qa/visual/refinement/production-1440.png), [tablet](../qa/visual/refinement/production-768.png), [mobile](../qa/visual/refinement/production-390.png), [small mobile](../qa/visual/refinement/production-320.png), [mobile mentor detail](../qa/visual/refinement/mentor-390.png) and [enquiry review](../qa/visual/refinement/enquiry-390.png). These generated screenshots and [raw audit data](../qa/visual/refinement/audit.json) remain in ignored local QA storage, outside production output.

## Performance observation and coverage limits

One local, unthrottled Chrome load per viewport, reduced motion, Google stubbed, while other local suites were running:

| Width | Initial LCP | Observed CLS |
| --- | --- | --- |
| 1440px | 632ms | 0.0005 |
| 768px | 392ms | 0.0659 |
| 390px | 444ms | 0.0868 |
| 320px | 336ms | 0.0774 |

Initial resource bodies total approximately 2.53 MB; scrolling through the page raises that to 3.06 MB across 17 resources. The unchanged 2,119,470-byte HERO-A PNG is the dominant cost. Responsive/compressed derivatives could improve slower-network loading, subject to preserving the approved artwork and the asset approval workflow. These measurements are local diagnostics, not field Core Web Vitals or a Lighthouse score. Production analytics, slow networks, physical devices, Safari/iOS, Firefox and manual screen-reader coverage remain unverified. Public video accessibility awaits asset approval, audio review and captions/transcripts; VID-04's recorded sideways ending remains an owner decision.

## Remaining launch blockers

1. Supply and explicitly approve the academy's international WhatsApp contact; record evidence in settings and test actual delivery with the owner. The local workflow is implemented but the public destination remains unconfigured.
2. Supply the individual gallery asset list, including linked posters and appropriate guardian/usage rights. Until then, keep the honest empty public gallery; do not publish pending assets.
3. Verify existing factual claims, mentor biography, subjects/boards, teaching commitments and contact/admissions details. Keep sample/review labels until verified replacements exist.
4. Review enquiry handling/privacy and the requested production analytics with the responsible owner.
5. Complete owner device/accessibility/performance review and explicit launch approval. Noindex remains enabled; a square master favicon is an optional branding improvement.
6. Obtain separate authorization before committing, pushing or deploying these local changes.

See [APPROVALS.md](APPROVALS.md) for the current approval register. Successful QA grants no new media or publication permission.
