# V2 media restoration and production asset audit

Date: 2026-11-01 (Asia/Calcutta). Work is local and uncommitted. No commit, push or deployment was performed.

## Result

The production build now restores the authentic blue-green logo, supplied HERO-A artwork and original IMG-12 seminar photograph. These three assets were individually approved by the owner in this task. The gallery remains in its existing empty state publicly because no gallery photographs, videos or thumbnails have been individually approved. The complete original V2 gallery remains available locally, with all supplied media also accessible through a private review index.

There was no redesign. `src/v2/index.html`, `base.css` and `concept.js` remain unchanged. The original card markup, filters, modals, typography and hero/mentor crop rules are retained. The logo keeps the supplied book/learner symbol and wordmark; it has not been redrawn.

## 1. Root cause

The deployed site at [va-academy.netlify.app](https://va-academy.netlify.app/) was inspected in a browser before editing. Its runtime data had `logo`, `hero` and `mentor` set to null and `gallery` set to an empty array; there were zero image/video elements. No failed page asset requests were observed. This confirmed intentional exclusion rather than a broken URL.

The previous builder consumed the legacy `content/media-manifest.json`, whose production gate admitted only `publish_status: "approved_for_public"`. No original asset had that value. `src/v2/v2.js` deliberately chose text/RM placeholders and an empty gallery when its generated media data omitted those URLs.

Images were not accidentally omitted during integration. Repository originals live under `media/vardhaman/`; the reference and V2 browser use `./media/...`. The V2 production build strips the archive's `vardhaman` segment when packaging. This mapping is now explicit per file as `source_path` and `production_path`, and supports different output filenames without gallery code changes. V1's `/media/vardhaman/...` contract is retained separately for legacy tests.

## 2. Handoff and source audit

Original ZIP: `C:/Users/erviv/Downloads/vardhaman-academy-v2-codex-handoff.zip`.

ZIP SHA-256: `cee3681f0783e7d867ea354a8595405107da105ae2794ff5b177236f90ff4497`.

- All **20 supplied media files**, totalling **32,013,423 bytes**, are present and byte-identical to the original ZIP and extracted reference.
- All **35 original handoff checksums** passed. The extracted reference remains unchanged.
- The supplied set comprises 10 JPEG/PNG images, five MP4s and five JPEG posters. Neither a separate transparent master logo nor an isolated academy symbol was included.
- The authentic logo was embedded in IMG-01, a historical flyer that also contains student imagery, obsolete class claims and old contact details. The full flyer is not a suitable public logo asset.
- `.gitignore` excludes generated `dist/`, local previews, private baselines and screenshots. It does not omit the retained source-media archive. The existing originals remain unchanged; the only new source image is the approved logo-only derivative.

Files inspected: V2 HTML/base styles/V2 styles, `concept.js`, `v2.js`, the old and new media manifests, build/preview/verifier scripts, archive directories, handoff approval/catalogue documents and `.gitignore`.

## 3. Approval register

The authoritative register for V2 is now `content/v2-media-manifest.json`. The legacy manifest remains unchanged for V1 regression only.

Each record includes ID, original/supplied filename, source path, production path, intended section, `approval_status` (`approved`, `pending`, `rejected`), required verifications, their completion flags, approval attribution/date/evidence, alt text/caption, and applicable gallery order, category, video duration and poster relationship. Approval records describe owner confirmations in this chat; no separate consent documents were supplied to the repository.

**Current state: 21 records = 3 approved, 15 pending, 3 rejected as-is.** The 21st record is the new logo derivative, not an additional handoff original.

| ID(s) | State | Public use / remaining verification |
| --- | --- | --- |
| LOGO-V2 | Approved | Owner approved a pixel-preserving logo-only Sharp crop for production. Full IMG-01 stays excluded. |
| HERO-A | Approved | Owner approved the supplied edited portrait and confirmed likeness/publication rights. |
| IMG-12 | Approved | Owner approved the original external-seminar image and rights. Inspection revealed embedded student portraits, names and marks on the projected school display; the owner then explicitly confirmed guardian consent covers every embedded student and instructed use of the original. This approval does not extend to other images. |
| IMG-09 | Pending | Alternative seminar image; separate rights/guardian review required. Available locally, not selected publicly. |
| IMG-14, IMG-16 | Pending | Identifiable student cricket photographs; guardian and usage rights required. |
| IMG-18, IMG-19 | Pending | Student recognition/certificate photos; guardian consent, usage rights and achievement verification required. |
| VID-02, VID-03, VID-04, VID-05, VID-06 | Pending | Individual permissions for student images/voices and usage rights. VID-04 also requires orientation review. |
| VID-02-POSTER through VID-06-POSTER | Pending | Each poster has its own explicit record and must be approved together with its parent video before it can appear publicly. |
| IMG-01, IMG-02 | Rejected as-is | Historical full flyers; do not publish their student imagery, obsolete offers/results/contact details as current promotional art. Originals are retained privately. |
| IMG-17 | Rejected as-is | Historical event/banner image contains obsolete course claims. Retained privately; review/edit and a new approval are needed before public use. |

The approved assets packaged at present are:

| ID | Repository source | Public URL | Bytes |
| --- | --- | --- | ---: |
| LOGO-V2 | `media/vardhaman/brand/vardhaman-logo.png` | `/media/brand/vardhaman-logo.png` | 123,653 |
| HERO-A | `media/vardhaman/hero/rushab-warm-hero-v1.png` | `/media/hero/rushab-warm-hero-v1.png` | 2,119,470 |
| IMG-12 | `media/vardhaman/mentor/rushab-seminar-img-12.jpeg` | `/media/mentor/rushab-seminar-img-12.jpeg` | 526,734 |

## 4. Code and build changes

- `content/v2-media-manifest.json` replaces the hardcoded V2 gallery catalogue and legacy V1 status dependency. Review/public logo, hero and mentor slots are also selected here.
- `src/v2-media.mjs` now validates and plans media. It rejects invalid states, unsafe/duplicate paths, mismatched types, orphan posters, missing identity/voice classifications and approved records without completed required checks or approval evidence. No gallery IDs or captions are hardcoded in the planner.
- `scripts/build-v2.mjs` emits public browser metadata and physically copies only permitted, selected files. Canonical source paths must remain inside the retained archive. Clean rebuilds remove revoked/stale media. Pending/rejected files and the full approval register never enter `dist/`.
- Videos require both their own approval and their poster's approval. A pending/rejected parent cannot release an approved poster, and a pending/rejected poster cannot release an otherwise approved video card.
- The private server maps every manifest path to its original source, maintaining loopback/Host/origin checks. `http://127.0.0.1:5173/media-review.html` lists all 20 originals and the logo derivative, including unused and rejected reference files. The index never enters production.
- `v2.js` reads captions/alt text from generated approved metadata, safely escapes text inserted into markup and retains all existing gallery controls. The mentor caption explicitly identifies an external event, not a Vardhaman-hosted event. The projected school's identity and results have not been altered or recast as academy achievements.
- The logo was extracted with the owner's explicit Sharp approval: source rectangle x=335, y=44, width=615, height=165. An automated test confirms every decoded pixel equals the corresponding original flyer pixel. No student image, old course list, contact number, tagline or unrelated emblem is included. The original flyer is untouched and excluded from public output. Two CSS variables map this isolated image back onto the existing 278x74 logo viewport, preserving reference scale and positioning.
- Hero `object-position: 9% center`, mentor `object-position: 30% center`, object-fit, proportions and responsive rules are unchanged.
- `scripts/verify-production.mjs` checks the exact file allowlist, source equality, generated public registry, media byte identity, URLs, fonts and headers. Extra private files fail verification. The existing Netlify configuration still publishes only verified `dist/`; no hosting configuration or remote content was changed.

To activate future approved media: update the relevant manifest record's status, complete only the genuinely verified requirements, and record approver/date/evidence. For videos, do the same for the linked poster. Keep pending/rejected items unchanged. For a new photo/video, add a record with an existing gallery category and optional order; no `v2.js` edit is needed. Rebuild and verify after approval or revocation. The private preview displays all selected original gallery records regardless of their public state.

## 5. Local before/after evidence

All screenshots remain local in ignored `qa/visual/media-restoration/`. They are not production assets. The before images were captured before this task's source changes; the private images may contain pending student media.

| View | Before | After |
| --- | --- | --- |
| Production hero, desktop | [RM/text brand](../qa/visual/media-restoration/production-before-1440-home.png) | [Restored approved hero/logo](../qa/visual/media-restoration/production-after-1440-home.png) |
| Production hero, phone | [RM/text brand](../qa/visual/media-restoration/production-before-390-home.png) | [Restored approved hero/logo](../qa/visual/media-restoration/production-after-390-home.png) |
| Production mentor, desktop | [RM placeholder](../qa/visual/media-restoration/production-before-1440-about.png) | [Original external seminar](../qa/visual/media-restoration/production-after-1440-about.png) |
| Production mentor, phone | [RM placeholder](../qa/visual/media-restoration/production-before-390-about.png) | [Original external seminar](../qa/visual/media-restoration/production-after-390-about.png) |
| Production gallery, desktop | [Empty approval state](../qa/visual/media-restoration/production-before-1440-life-at-vardhaman.png) | [Empty state retained pending permissions](../qa/visual/media-restoration/production-after-1440-life-at-vardhaman.png) |
| Private gallery, desktop | [Original full gallery](../qa/visual/media-restoration/private-before-1440-life-at-vardhaman.png) | [Full gallery retained](../qa/visual/media-restoration/private-after-1440-life-at-vardhaman.png) |
| Private gallery, phone | [Original full gallery](../qa/visual/media-restoration/private-before-390-life-at-vardhaman.png) | [Full gallery retained](../qa/visual/media-restoration/private-after-390-life-at-vardhaman.png) |

Reference comparison results are recorded under `qa/visual/media-restoration/reference-parity/`; asset hashes are in `asset-integrity.json`. All 63 comparisons pass the existing 0.5% threshold at 1440/390/768px. Section geometry matches exactly at all three widths; 59 comparisons have zero counted changed pixels. Maximum difference is 0.0817% in a native video modal state. Three implementation MP4 fetches were recorded as `net::ERR_ABORTED` when the modal was closed; there were no missing-file HTTP or JavaScript errors in this comparison, and the separate video playback regressions passed.

## 6. Validation results

Validation is local; the deployed site was inspected read-only and has not received these changes.

| Check | Result |
| --- | --- |
| Original ZIP / media audit | PASS: all 20 originals are present and byte-identical; all 35 handoff checksum entries verified. |
| Syntax and contract regressions | PASS: recursive syntax check and 16/16 V1/V2/production contract tests. |
| Approval/path regressions | PASS: missing rights/guardian evidence, unknown states, duplicate/unsafe paths, new manifest-only IDs, separate source/output paths and poster-parent gating tested. |
| Isolated production packaging | PASS: synthetic approved fixture files copy correctly without changing real permissions; revocation removes stale files; missing approved source fails the build. |
| Production artifact / HTTP audit | PASS: 16 files, three public media files, zero public gallery/video/poster files. All approved media bytes match source; every pending/rejected URL returns 404; the private index/manifest/source endpoints are absent. |
| Production browser suite | 8 functional runs PASS in Chrome/Edge (desktop and phone), plus 1 expected accessibility failure. Playwright reports `9 passed`; accessibility itself remains FAIL. |
| Future gallery activation fixtures | PASS: entirely browser-local manifest fixtures demonstrate photo/video filters, captions, escaping, decoded images, paused initial video, playback/close/pause and focus return. Actual release records and `dist/` are not modified. The local original clip used by interception never enters public output. |
| Private V2 browser suite | 10 functional runs PASS, including all five supplied MP4s; 2 inherited accessibility failures reproduced as expected failures. Playwright reports `12 passed`. |
| Production asset loading / layout | PASS: both portrait images decode, authentic logo loads, original object positions are retained, no page image-loading/JavaScript/CSP errors or external requests, and no horizontal overflow at 1440/768/390/320px in Chrome and 390px in Edge. |
| Production axe audit | Known FAIL: default-state `color-contrast`, 2 affected nodes. This is not a complete accessibility clearance. |
| ZIP visual comparison | PASS: 63/63 at 1440/390/768px, exact section geometry, 59 pixel-identical checks, maximum 0.0817% difference. Includes the unchanged full private gallery and interactive states. |

## 7. Remaining approvals and blockers

- Gallery guardian/usage permissions remain outstanding. No gallery asset or poster has been promoted on the strength of a design decision or the limited IMG-12 confirmation. The registry can activate them individually later.
- Retain the rejected full flyers/event banner privately; any revised public variant needs its own review and approval. The master transparent logo is still unavailable, although the approved exact crop restores the genuine symbol now.
- Verify award details, final video captions/transcripts and the VID-04 sideways ending before approval. Large source media is retained unchanged for visual fidelity; optimised approved derivatives and slower-device/network checks remain future work.
- Existing contrast and modal focus-containment defects remain. The sticky mobile CTA may overlap lower content and the desktop hero CTA can fall below the initial viewport; these were not redesigned.
- The enquiry remains a non-submitting message/copy demo. Factual claims, final contacts, genuine stories, SEO/indexing decisions and broader launch checks remain as documented in prior reports. Safari/iOS, Firefox, physical-device and screen-reader coverage are still outstanding.
- Public media URLs are accessible to anyone after deployment. The approval gate is physical packaging, while noindex/robots are indexing controls only. Updating the manifest locally does not remove a file already hosted; a subsequent approved rebuild/deployment is required for revocation.

No commit, push or deployment has been performed. This report and the locally verified output are provided for review before any such action.
