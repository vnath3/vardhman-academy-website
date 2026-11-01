# Acceptance criteria and QA test plan

Two independent quality gates are required: **visual parity** and **functional quality**. Passing unit or browser tests alone is not evidence of parity with this ZIP's actual HTML reference.

## A. Visual parity (Milestone 1)

- [ ] Run `reference_site/` and the integrated site locally at the same time.
- [ ] Compare at **1440×900 desktop** and **390×844 mobile**; include 768px tablet if feasible.
- [ ] Record annotated before/after screenshots or an equivalent section-by-section comparison of hero, mentor, gallery, stories, class/quiz, parent enquiry and footer.
- [ ] Match official blue-green academy symbol/wordmark, hero portrait framing, hierarchy, spacing, rounded cards, palette and prominent CTA.
- [ ] Preserve all original interactive sections; no replacement by an unrelated static/editorial template.
- [ ] Keep current **Classes 5–10** and correct official name throughout, including metadata, dynamically rendered content and FAQs.
- [ ] List intentional visual differences and approval requests explicitly.

## B. Functional interaction test matrix

| ID | Journey | Expected result |
| --- | --- | --- |
| F-01 | Header navigation desktop/mobile | Anchors lead to correct sections; mobile menu opens/closes; keyboard accessible |
| F-02 | Academy CTA | Reaches parent enquiry demo without transmitting personal information |
| F-03 | Gallery filter All/Activities/Achievements/Community | Correct subset and selected state; no layout break or stale cards |
| F-04 | Gallery photo card | Full image/lightbox renders, caption correct, close works |
| F-05 | Gallery video card | MP4 loads from local asset path; controls respond, close pauses, no autoplay audio |
| F-06 | Video VID-04 | Sideways segment documented and corrected or excluded from public shortlist |
| F-07 | Student story carousel | Next/previous/category states work, content labelled illustrative |
| F-08 | Class journey | Only 5–10 available; text, stage and navigation update correctly |
| F-09 | Brain Spark | Level switching, correct/incorrect feedback and three-question progress work |
| F-10 | Parent enquiry | Four steps progress/backtrack, validation sensible, no data sent |
| F-11 | FAQ | Accordions open/close and display confirmed course information |
| F-12 | Missing media/error path | Broken URLs or unsupported playback don't create blank/inaccessible controls |

## C. Accessibility and responsiveness

- [ ] Keyboard-only flow works for navigation, gallery, modal, quiz and enquiry.
- [ ] Visible focus treatment and accessible button names/labels are preserved.
- [ ] Images have useful alternative text; decorative marks are not noisy to assistive technology.
- [ ] Dialog has understandable role/name, sensible focus management and Escape handling.
- [ ] Text and control contrast are reasonable; reduced-motion preference respected.
- [ ] Phone layout has no unintended horizontal scrolling or offscreen CTA/modal controls.
- [ ] Layout and videos work on Chrome and at least one other browser/device if available.

## D. Media, performance and content

- [ ] Every asset referenced from HTML/CSS/JS exists using the **correct relative path**.
- [ ] Offline/local preview doesn't depend on external original image URLs (fonts may require network fallbacks).
- [ ] No unapproved student asset uploaded to public CDN, YouTube, analytics or open Git repository.
- [ ] Images are appropriately sized/loaded, video preload conservative, no serious initial rendering delay.
- [ ] No invented testimonial, ranking, percentage, affiliation or inconsistent class range.
- [ ] All public-launch blockers from `docs/APPROVALS.md` remain clearly marked as pending.

## E. Required report

Provide per-check **Pass / Fail / Not tested**, steps/command used, failure detail, screenshots where helpful and priority. Clearly distinguish Milestone 1 parity completion from later final-launch readiness. Do not label final QA complete while mobile or privacy checks remain open.

