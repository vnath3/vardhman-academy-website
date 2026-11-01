# V2 QA report — Milestone 1

Date: 2026-11-01. Target: actual bundled V2, private local review. Visual evidence: [../docs/V2_VISUAL_PARITY_REPORT.md](../docs/V2_VISUAL_PARITY_REPORT.md). This is not final release QA.

## Commands and results

| Command/check | Result |
| --- | --- |
| Supplied `tools/check-handoff.mjs` | PASS: 23 required files, 20 media files and source references present. |
| Supplied `tools/SHA256SUMS.txt` | PASS: all 35 listed checksums verified against the unpacked ZIP. |
| V1 preservation check | PASS: existing source, tests, contracts, media and handoff documents retained byte-for-byte; original README content retained beneath V2 introduction and in snapshot. |
| `npm.cmd run check` | PASS: existing syntax checks, including new root scripts/tests. New browser files are compiled by Playwright; both `src/v2/concept.js` and `src/v2/v2.js` also passed `node --check`. |
| `npm.cmd test` | PASS: original 6/6 contract/access/build tests. |
| `npm.cmd run test:browser` | PASS: original 8/8 V1 browser tests. |
| `npm.cmd run test:v2` | PASS: 4/4 new identity, source-grade, media/path, explicit-private-build and HTTP safety tests. |
| `npm.cmd run test:browser:v2` | 10 normal tests PASS, plus 2 known accessibility failures reproduced with `test.fail`. Playwright prints `12 passed` and exits zero because the failures are declared expected; accessibility itself remains FAIL. |
| Visual comparisons | PASS: 63 viewport pairs across desktop/phone/tablet, plus 24 full-section desktop/phone pairs. All 33 default section views and all 24 full-section views have zero counted pixel differences; minor native-video raster differences remain in some viewport pairs. |
| `npm.cmd run build:v2` | PASS: private V2 review output only; no production release artifact or public media copy. |
| `npm.cmd run build` | PASS: retained V1 production build; no unapproved media. This does not build a publishable V2. |
| `npm.cmd audit --audit-level=low` | PASS: 0 vulnerabilities. No dependencies were added or changed for V2. |

The documented default `npm.cmd run dev` command was also started directly and returned HTTP 200 at `127.0.0.1:5173`, with correct static title/grades and no old class range in its source.

## Functional acceptance matrix

| ID | Result | Evidence / steps |
| --- | --- | --- |
| F-01 Navigation | PASS, with accessibility limits below | Chrome 1440/768/390/320: sections and logo visible; keyboard-operated mobile menu opens, link navigation closes it; CTA reaches enquiry. Edge 390 smoke also passes. |
| F-02 Parent CTA | PASS | Main CTA reaches the demo; no network transmission. Mobile sticky CTA preserved as in reference. |
| F-03 Gallery filtering | PASS | 10 All moments; 7 Sports & play; 2 Achievements; 1 Community. Selected aria state and hidden-card counts verified. |
| F-04 Photo lightbox | PASS for reference behavior | Full photo, pending-permission caption, close focus, Escape and focus return verified. Focus containment fails; see D-02. |
| F-05 Video | PASS | All 5 clips decode from local originals; no MP4 request before a gallery action. Player opens paused with controls/playsInline, plays after action, and pauses/removes on close. Video modal comparisons include poster/loaded-frame states. |
| F-06 VID-04 | DOCUMENTED DEFECT | Original is portrait 576×1024, ~53.65s. Source turns sideways near the end. Existing V1 start/end frame inspection and regression test retained; V2 uses the same bytes and native orientation. No destructive edit. Public shortlist remains blocked. |
| F-07 Stories | PASS | All/STEM/Beyond marks groups 5/3/2; next/previous movement and disabled state; modal and Escape/focus return. Sample/illustrative labels remain visible. |
| F-08 Class journey | PASS | Only six choices 5–10 in source; Class 5/9/10 copy and stage update; one pressed option; next 10→5, previous 5→10; out-of-range 2 clamps to 5. |
| F-09 Brain Spark | PASS | All three levels; incorrect and correct feedback; all three questions; result score; retry/reset. Educational suitability still needs owner review. |
| F-10 Parent demo | PASS | Class/concern validation, all four steps, optional synthetic goal, summary, edit/back and clipboard copy. No phone/email inputs, POST, cookies or local/session storage. Reload clears the note. |
| F-11 FAQ | PASS | Confirmed current class text; location answer opens; aria-expanded changes with accordion. |
| F-12 Missing media fallback | FAIL, inherited | Simulated local MP4 404 produces native media error code 4 but no custom announced error/retry text; caption remains the normal clip description. Diagnostic stored in `qa/visual/v2-diagnostics.json`. |

## Responsive, media and privacy checks

Chrome tests cover 1440×900, 768px tablet, 390px phone and 320px narrow phone, with no document-level horizontal overflow. Reference/implementation parity uses exact 1440×900, 390×844 and 768×1024 viewports. Edge 390×844 smoke passes, but Edge and Chrome both use Chromium; Safari/iOS, Firefox and physical-device tests are NOT TESTED.

All rendered images/posters resolve and decode. All 19 allowlisted reference URLs (including the five MP4s) return 200 for HEAD; original video range requests return 206 with correct byte lengths. The unused historical results flyer is retained in the archive but not exposed as a gallery/current offer. All 20 supplied media originals remain unchanged. No integrated-page external request was observed; fonts are local. Bad paths return 404, POST is refused, and cross-origin/invalid-Host requests are refused. Both V2 and the reference are served only on 127.0.0.1.

Measured cold desktop resource bodies total about **5.50 MB** before scrolling (7 image requests, zero MP4 requests). This is a measured transfer-size observation, not a full performance or slow-network benchmark. Original high-resolution image use is preserved for parity; future optimization should reuse V1's derivative approach while verifying crops/appearance.

## Observed defects and remaining risks

| ID | Priority | Status and reproduction |
| --- | --- | --- |
| D-01 Rendered gallery order | Medium | INHERITED / OPEN. Reference HTML inserts after mentor, but flex `order: 0` displays gallery immediately after hero. Integration matches actual reference. Decide written-intent order in Milestone 2. |
| D-02 Dialog focus containment | High | INHERITED / OPEN. Open photo, Tab from close: focus leaves dialog. Story dialog also lets Tab after its last button reach background. Escape/close/focus return work. Needs trap/inert background and keyboard/screen-reader review. Regression is recorded as an expected failure. |
| D-03 Contrast | High | INHERITED / OPEN. axe reports `color-contrast`; the final default-state audit reports 32 affected nodes (counts vary with rendered/revealed state). Examples include small hero labels and muted/gallery text. Full audit is in `qa/visual/v2-axe-final.json`. Expected failure records the unresolved issue; no claim of WCAG compliance. |
| D-04 VID-04 rotation | Medium | INHERITED / OPEN. Ending is sideways within the source, not an incorrect player rotation. Approve an edited derivative/trim or exclude from release. |
| D-05 Missing-video feedback | Medium | INHERITED / OPEN. Fault injection confirms code-4 native playback failure without accessible custom feedback/retry. |
| D-06 Initial media weight | Medium | MEASURED RISK. ~5.50 MB resource bodies at desktop cold load. No network throttling, low-memory-phone or Core Web Vitals benchmark performed. |
| D-07 First-screen/sticky CTA | Medium | INHERITED UX LIMIT. Reference's large desktop headline places its main CTA below the 900px fold. Mobile fixed CTA overlaps underlying content near the bottom of the viewport. Preserved visibly in comparison pairs, not redesigned. |
| D-08 Content/publication approval | Release blocker | OPEN. Logo crop is not an isolated master asset; hero likeness, 500+/boards/subjects/mentor claims, student consent/rights/awards and exact contact details remain pending. Story cards remain explicitly illustrative. |
| K-02 Runtime-only old grades | Fixed within Milestone 1 | Raw source/metadata and generated controls now use 5–10; no Grade 1–4 options are created or exposed. This is a source/content correction with matching visible layout. |

Screen-reader navigation beyond focused keyboard checks, native video captions/transcripts/audio review, clipboard failure fallback on unsupported browsers, browser Back/Forward recovery, full-clip viewing and real touch/orientation changes remain NOT TESTED. Reduced-motion is used for stable parity captures and supported by the inherited CSS; a full motion sensitivity review remains open.

## Release boundary

No push, deployment, upload, analytics, WhatsApp backend, admission/contact transmission or domain change occurred. The full V2 public-release approval list remains [../docs/handoff-v2/docs/APPROVALS.md](../docs/handoff-v2/docs/APPROVALS.md). All screenshots show owner-review material and remain local/ignored under `qa/visual/`. A successful Milestone 1 comparison is not consent or publication approval.
