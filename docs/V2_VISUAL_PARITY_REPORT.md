# V2 visual parity report - Milestone 1

Date: 2026-11-01. **PASS for rendered-reference parity** at 1440 x 900 desktop, 390 x 844 phone and 768 x 1024 tablet. This is a local visual/interaction comparison, not public-release approval or an accessibility pass.

## Method and evidence

The original V1 site and the untouched bundled V2 reference were previewed and captured before integration at 1440 and 390 pixels. Those baseline images and layout measurements remain in `qa/visual/before/`. V1 lacked the reference symbol, full interactive design and several entire sections; no inference of parity was made from its passing tests.

The final V2 integration and original reference were then run simultaneously on loopback ports 5174 and 4173. `npm.cmd run compare:v2` captured 11 default section views and 10 interaction-state views at each of 3 widths: **63 reference/implementation pairs**. Reference is on the left, implementation on the right in every paired image. Full-page captures, separate originals, pixel-difference maps and measured section positions/heights are retained under `qa/visual/parity/`.

The harness uses the same installed Chrome, viewport, reduced-motion setting and exact reference font files. Its original reference HTML/CSS/JS remains unmodified; the Google Fonts responses are replayed from the same downloaded WOFF2 files to remove network timing. Images are decoded, reveals triggered, pointer parked outside controls, and each page brought to the foreground before capture. This avoids accidental hover/background-tab differences. The difference map counts pixels whose largest RGB-channel difference exceeds 12/255; the review threshold is 0.5% per viewport, supplemented by actual visual inspection. Comparisons are specific to this environment, not a cross-platform pixel-perfect claim.

**All 33 default section screenshots have zero counted pixel differences. 59 of all 63 views have zero counted differences.** The remaining views differ by at most 0.0407%, chiefly native video controls/frame compositing and four gallery raster pixels on phone. All measured section top positions/heights and document widths match. No application-script errors or broken media responses were recorded. The raw log records three expected `net::ERR_ABORTED` cancellations (one per viewport) when the video modal closes and its in-flight download is stopped; these are not missing assets.

## Section-by-section and state results

Every screenshot link below opens a paired view (reference left, integration right). A PASS means visual parity, including inherited reference defects described afterward; it does not certify quality of the underlying reference design.

| Checkpoint/state | Desktop 1440 | Phone 390 | Tablet 768 | Inspection notes |
| --- | --- | --- | --- | --- |
| hero | [PASS (0.0000%)](../qa/visual/parity/pair-1440-hero.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-hero.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-hero.png) | Exact flyer crop, headline wrapping/highlight, palette, arched portrait, nameplate, callout and CTAs. |
| parents | [PASS (0.0000%)](../qa/visual/parity/pair-1440-parents.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-parents.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-parents.png) | Same three concern cards, hierarchy and example-not-testimonial note. |
| mentor | [PASS (0.0000%)](../qa/visual/parity/pair-1440-mentor.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-mentor.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-mentor.png) | Same seminar photo/crop, external-event caption, facts and review placeholders. |
| gallery | [PASS (0.0000%)](../qa/visual/parity/pair-1440-gallery.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-gallery.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-gallery.png) | Same grid/cards/posters/filter toolbar; 10 local review moments. |
| stories | [PASS (0.0000%)](../qa/visual/parity/pair-1440-stories.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-stories.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-stories.png) | Same deep-blue background, illustrated sample cards, filters and carousel controls. |
| values | [PASS (0.0000%)](../qa/visual/parity/pair-1440-values.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-values.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-values.png) | Same three outcome cards, icons, descriptions and warm backgrounds. |
| classes | [PASS (0.0000%)](../qa/visual/parity/pair-1440-classes.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-classes.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-classes.png) | Same stage, initial Class 5, six visible choices and detail panel. |
| quiz | [PASS (0.0000%)](../qa/visual/parity/pair-1440-quiz.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-quiz.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-quiz.png) | Same level controls, brain illustration, initial question/answers and score/progress. |
| enquiry | [PASS (0.0000%)](../qa/visual/parity/pair-1440-enquiry.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-enquiry.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-enquiry.png) | Same personal four-step demo layout and initial class selector. |
| faq | [PASS (0.0000%)](../qa/visual/parity/pair-1440-faq.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-faq.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-faq.png) | Same questions, expanded state, confirmed classes and spacing. |
| footer | [PASS (0.0000%)](../qa/visual/parity/pair-1440-footer.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-footer.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-footer.png) | Same logo crop, columns, locality and navigation. |
| gallery-achievements | [PASS (0.0000%)](../qa/visual/parity/pair-1440-gallery-achievements.png) | [PASS (0.0012%)](../qa/visual/parity/pair-390-gallery-achievements.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-gallery-achievements.png) | Two achievement cards and selected filter state. |
| photo-modal | [PASS (0.0000%)](../qa/visual/parity/pair-1440-photo-modal.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-photo-modal.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-photo-modal.png) | Same image, caption, overlay, close control and sizing. |
| video-modal | [PASS (0.0042%)](../qa/visual/parity/pair-1440-video-modal.png) | [PASS (0.0407%)](../qa/visual/parity/pair-390-video-modal.png) | [PASS (0.0144%)](../qa/visual/parity/pair-768-video-modal.png) | Same loaded paused video and controls; native browser raster varies slightly. |
| stories-personal | [PASS (0.0000%)](../qa/visual/parity/pair-1440-stories-personal.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-stories-personal.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-stories-personal.png) | Same Beyond marks selected state and two sample stories. |
| class-9 | [PASS (0.0000%)](../qa/visual/parity/pair-1440-class-9.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-class-9.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-class-9.png) | Same selected Class 9, stage number, description and focus skills. |
| class-10 | [PASS (0.0000%)](../qa/visual/parity/pair-1440-class-10.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-class-10.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-class-10.png) | Same selected Class 10, graduation stage and readiness skills. |
| quiz-feedback | [PASS (0.0000%)](../qa/visual/parity/pair-1440-quiz-feedback.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-quiz-feedback.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-quiz-feedback.png) | Same correct feedback, highlighted answer, score and enabled next action. |
| enquiry-step-2 | [PASS (0.0000%)](../qa/visual/parity/pair-1440-enquiry-step-2.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-enquiry-step-2.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-enquiry-step-2.png) | Same concern choices and progress. |
| enquiry-step-3 | [PASS (0.0000%)](../qa/visual/parity/pair-1440-enquiry-step-3.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-enquiry-step-3.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-enquiry-step-3.png) | Same optional goal field and progress. |
| enquiry-step-4 | [PASS (0.0000%)](../qa/visual/parity/pair-1440-enquiry-step-4.png) | [PASS (0.0000%)](../qa/visual/parity/pair-390-enquiry-step-4.png) | [PASS (0.0000%)](../qa/visual/parity/pair-768-enquiry-step-4.png) | Same generated demo summary, edit/copy controls and privacy note. |

Machine results: [comparison.json](../qa/visual/parity/comparison.json). Local baseline screenshots: [V1 desktop](../qa/visual/before/v1-1440-full.png), [reference desktop](../qa/visual/before/reference-1440-full.png), [V1 phone](../qa/visual/before/v1-390-full.png), [reference phone](../qa/visual/before/reference-390-full.png). Final full pages: [reference desktop](../qa/visual/parity/reference-1440-full.png), [integration desktop](../qa/visual/parity/implementation-1440-full.png), [reference phone](../qa/visual/parity/reference-390-full.png), [integration phone](../qa/visual/parity/implementation-390-full.png).

## Full-section detail views

The additional `npm.cmd run compare:v2:details` command captures 24 pairs at full section height on desktop and phone. These show the hero portrait/buttons, all gallery rows, class descriptions/selected controls and complete enquiry summaries that do not fit in a single phone viewport. In these supplemental element screenshots only, the header/progress bar/fixed mobile CTA are hidden, and the sticky enquiry lead is made static via Playwright's screenshot-only style option. This prevents viewport-relative overlays appearing at arbitrary heights inside a tall element capture. No application CSS was changed; their actual appearance and overlap remain visible in the unmodified viewport comparisons above.

| Full section/state | Desktop | Phone |
| --- | --- | --- |
| hero-full | [Pair](../qa/visual/details/pair-1440-hero-full.png) | [Pair](../qa/visual/details/pair-390-hero-full.png) |
| mentor-full | [Pair](../qa/visual/details/pair-1440-mentor-full.png) | [Pair](../qa/visual/details/pair-390-mentor-full.png) |
| gallery-full | [Pair](../qa/visual/details/pair-1440-gallery-full.png) | [Pair](../qa/visual/details/pair-390-gallery-full.png) |
| stories-full | [Pair](../qa/visual/details/pair-1440-stories-full.png) | [Pair](../qa/visual/details/pair-390-stories-full.png) |
| class-5-full | [Pair](../qa/visual/details/pair-1440-class-5-full.png) | [Pair](../qa/visual/details/pair-390-class-5-full.png) |
| class-9-full | [Pair](../qa/visual/details/pair-1440-class-9-full.png) | [Pair](../qa/visual/details/pair-390-class-9-full.png) |
| class-10-full | [Pair](../qa/visual/details/pair-1440-class-10-full.png) | [Pair](../qa/visual/details/pair-390-class-10-full.png) |
| quiz-full | [Pair](../qa/visual/details/pair-1440-quiz-full.png) | [Pair](../qa/visual/details/pair-390-quiz-full.png) |
| enquiry-1-full | [Pair](../qa/visual/details/pair-1440-enquiry-1-full.png) | [Pair](../qa/visual/details/pair-390-enquiry-1-full.png) |
| enquiry-2-full | [Pair](../qa/visual/details/pair-1440-enquiry-2-full.png) | [Pair](../qa/visual/details/pair-390-enquiry-2-full.png) |
| enquiry-3-full | [Pair](../qa/visual/details/pair-1440-enquiry-3-full.png) | [Pair](../qa/visual/details/pair-390-enquiry-3-full.png) |
| enquiry-4-full | [Pair](../qa/visual/details/pair-1440-enquiry-4-full.png) | [Pair](../qa/visual/details/pair-390-enquiry-4-full.png) |

**All 24 full-section pairs PASS with zero counted pixel differences and matching dimensions.** Full-section measurements: [details/comparison.json](../qa/visual/details/comparison.json). These supplement rather than replace the screenshots with real navigation/CTA overlays.

## Intentional source/environment differences

- Source name, title, grade metadata and generated options are correct before JavaScript; hidden Classes 1-4 and runtime deletion are removed. The visible six-control geometry and selected states match the reference.
- Reference inline CSS and behavior are externalized into `base.css` and `concept.js`; this changes packaging, not presentation.
- Fonts are served locally from the exact reference files; no Google Fonts request is needed by the integration. Source original media filenames and `./media/...` URLs remain intact through the local server adapter.
- Private-only noindex metadata, local Host/origin checks, GET/HEAD-only serving and an explicit production build refusal are added without changing visible layout. No V1 review toggle was inserted into V2: the loopback review itself is the private boundary.

## Known reference defects retained, and quality status

1. **Gallery placement discrepancy:** written handoff says after the mentor, but actual flex order places gallery immediately after hero, before trust/parents/mentor. Both pages match this observed order. Correcting it is a future, explicit behavior/layout change.
2. **Contrast and dialogs:** inherited muted/small text fails automated contrast checks, and both dialog implementations allow keyboard focus to escape. Focus on open, Escape, close/pause and focus return do work. These defects are not a visual mismatch and are not claimed fixed.
3. **Reference UX limits:** large desktop hero pushes its primary action below the 900px fold; mobile fixed CTA covers part of underlying content at the viewport bottom. Screenshots deliberately retain these behaviors. No editorial simplification was made to hide them.
4. **Media:** VID-04 turns sideways inside the original recording. Missing-video errors have no custom accessible feedback. Original high-resolution images also make initial transfer heavy. See the QA report for observations, reproduction and test limits.
5. **Brand/content approvals:** flyer-cropped logo remains a review asset; isolated master logo, likeness, rights/guardian permissions, claims and real student accounts remain pending. All sample stories remain illustrative, not factual testimonials.

These do not invalidate fidelity to the supplied working reference, but they keep the quality/public-release gate open. There are no unresolved intentional visual redesigns. Final launch, production V2 packaging, Safari/Firefox/physical-device verification and the supplied approval checklist remain outside this Milestone 1 completion.

## Reproduce

From the repository, run these in separate terminals:

```powershell
npm.cmd run dev:reference
npm.cmd run dev -- --port 5174
npm.cmd run compare:v2
```

The first command requires the already-extracted supplied ZIP at `.review-baselines/v2-handoff/reference_site/`. Screenshots contain private review media and are ignored by Git. They are local artifacts; no public screenshot or preview URL was created.
