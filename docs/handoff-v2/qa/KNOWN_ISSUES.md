# Known issues, limits and verification risks

This inventory distinguishes **observed defects**, **implementation risks** and **publication approvals**. Do not treat an untested behavior as a verified bug or claim all concerns are resolved by a successful build.

## Confirmed / observed

| ID | Severity | Observation | Suggested handling |
| --- | --- | --- | --- |
| K-01 | Medium | `VID-04` rotates sideways near the end. | Review the full clip; trim/rotate correctly or exclude from public shortlist. Preserve original in handoff. |
| K-02 | Medium | Reference source `index.html` originated from a concept covering Classes 1–10; `v2.js` changes/hides legacy text and control options **at runtime** to display confirmed Classes 5–10. | Integrate the corrected 5–10 rules into stable app content/data; avoid stale text visible before JS or to crawlers. |
| K-03 | Medium | The academy logo is currently rendered through a CSS viewport into a legacy flyer, not a high-resolution standalone logo. | Obtain the source logo and swap without altering the blue-green symbol. Current crop is a valid visual reference, not the final brand asset. |
| K-04 | High for public launch | Hero uses a refined concept portrait of Rushab Sir, awaiting likeness and publication approval. | Confirm with mentor/owner or replace with approved original. |

## Not fully tested / integration risks

| ID | Risk | Verification to perform |
| --- | --- | --- |
| R-01 | Mobile/tablet layout and responsive menu | Verify at phone, tablet and desktop widths with actual touch, orientation and keyboard. |
| R-02 | Large media and multiple videos affect load performance | Test total transfer size, initial load, lazy loading, slow connection and memory on phones. MP4 assets remain local in V2. |
| R-03 | Modal focus trap and cross-browser media behavior | Test keyboard Tab/Escape, focus return, pause-on-close, Safari/iOS, video orientation. |
| R-04 | Quiz content mapped from original concept levels | Confirm grade-appropriate questions for Classes 5–6, 7–8 and 9–10. Current quiz is an interactive demonstration, not a formal assessment. |
| R-05 | The actual GitHub checkout may have different CSS/component architecture | Compare sources and existing test fixtures before integration; don't force a blind overwrite. |
| R-06 | Public/production media use | Keep private/local until guardian consent, copyrights and certificate claims are cleared. |

## Intentionally not implemented

- Backend lead collection or WhatsApp workflow.
- YouTube hosting/embeds, analytics, official domain.
- Real testimonials/alumni case studies (current story cards are illustrative).
- Production publish of student photos/videos.

## Already checked in the owner review preview

- Class selection updates the learner journey (e.g., Class 9 changes visible stage/copy).
- Gallery category filter returns appropriate cards (Achievements shows two cards).
- A video card opens a functional browser-controlled modal player.
- Brain Spark correct answer gives feedback and enables continuation.

These are focused manual checks, **not a comprehensive device or automated test suite**.

