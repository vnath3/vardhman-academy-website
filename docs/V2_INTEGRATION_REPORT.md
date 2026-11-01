# V2 integration report — Milestone 1

Date: 2026-11-01. Scope: visual and interaction parity with the supplied working V2 reference, locally only. No commit, push, deployment, domain/audience change, analytics connection, WhatsApp integration or external media upload was performed.

## Result and scope boundary

The active development command now runs the actual V2 integration. Its original sections, logo crop, typography, hero, gallery/lightbox, illustrative story carousel, Classes 5–10 journey, Brain Spark and four-step non-submitting parent demo are present. Comparison evidence, per-section results and deliberate differences are in [V2_VISUAL_PARITY_REPORT.md](V2_VISUAL_PARITY_REPORT.md); tests and observed defects are in [../qa/V2_TEST_REPORT.md](../qa/V2_TEST_REPORT.md).

Milestone 1 reproduces the rendered reference, including disclosed inherited defects. It does not claim launch readiness or that accessibility defects are fixed. Broader quality changes belong to the handoff's Milestone 2 and were not silently substituted for visual fidelity.

## Baselines and preserved work

The existing repository contained the uncommitted V1 implementation from the previous task, not an empty checkout this time. It was inspected before editing. The complete non-generated V1 work was snapshotted to `.review-baselines/v1-before-v2.zip` before changes. There were no applicable `AGENTS.md` files.

Both baselines ran concurrently: original V1 at `127.0.0.1:5173`, untouched V2 reference at `127.0.0.1:4173`. Before screenshots at 1440×900 and 390×844 are under `qa/visual/before/`. V1 differed substantially: text-only logo, serif editorial page, different section layout, a toggle-based gallery and none of the reference's carousel/class/quiz/enquiry interactions. These differences were recorded before integrating the actual source.

All original V1 application files, scripts, contracts, media, tests and handoff documents remain unchanged. A SHA-256 check confirmed 42 original files unchanged before the README update; the original README is retained byte-for-byte beneath its new V2 introduction, and in the snapshot. The only changes to existing files are additive package scripts/default dev routing, added ignore rules, and that README introduction. The original test files and Playwright config were not weakened or rewritten.

The V2 handoff's 35 supplied SHA-256 entries were verified, and its supplied checker passed. All 20 media originals match the retained V1 archive byte-for-byte, so media was reused rather than replaced or duplicated.

## Reused, added and changed files

| Path | Handling |
| --- | --- |
| `src/sections.mjs`, `src/styles.css`, `src/app.js`, `src/media.mjs` | Retained unchanged for V1 and its tests. |
| `scripts/build.mjs`, `scripts/serve.mjs`, `scripts/images.mjs` | Retained unchanged, including V1's production allowlist and private media gates. |
| `tests/contracts.test.mjs`, `tests/browser/`, `playwright.config.mjs` | Retained unchanged; original 6 contract and 8 browser tests rerun. |
| `content/`, `media/vardhaman/`, `docs/handoff/`, `docs/IMPLEMENTATION.md` | Retained unchanged. V1 media approval statuses were not silently changed. |
| `src/v2/index.html` | Reference HTML adapted in place to the existing static architecture. Correct name/grades/title in raw source, local font links, noindex metadata. |
| `src/v2/base.css`, `src/v2/concept.js` | Original inline reference style and interaction code extracted into external files. Class creation/clamping/selection now uses only 5–10. |
| `src/v2/v2.css`, `src/v2/v2.js` | Supplied V2 presentation and interaction layers retained. Removed the obsolete runtime deletion/hiding of the first four class options because the source now creates only valid classes. |
| `src/v2/fonts.css`, `src/v2/fonts/`, `src/v2/NOTICE.md` | Exact reference font responses hosted locally, with upstream OFL licences and provenance. No external font dependency in the integrated page. |
| `scripts/build-v2.mjs`, `scripts/serve-v2.mjs` | Explicit private-review build and loopback server. Serve the reference's exact `./media/...` URLs from retained originals; byte-range video support, local Host/origin checks, GET/HEAD only and CSP preventing form submission or external scripts/requests. |
| `scripts/compare-v2.mjs`, `scripts/compare-v2-details.mjs` | Reproducible reference/implementation screenshots, paired images, pixel-difference maps, layout measurements and interaction-state captures. |
| `tests/v2.contracts.test.mjs`, `tests/v2-browser/`, `playwright.v2.config.mjs` | New V2-specific tests without replacing V1 coverage. Chrome plus Edge smoke; known accessibility failures explicitly reproduced. |
| `docs/handoff-v2/` | Original V2 task, README, decisions, approvals and QA documents retained for review. |
| `package.json`, `.gitignore`, `README.md` | V2 scripts/default preview, local artifact ignores and new instructions. Dependency versions and `package-lock.json` remain unchanged. |

## Important integration decisions and differences

1. **Real symbol restored:** V2 explicitly permits the reference's exact CSS crop of IMG-01 for private parity. Its blue-green book/learner symbol and wordmark are intact. No generic icon, text-only replacement, redrawing or AI-generated logo was substituted. The isolated original logo remains a launch approval.
2. **Rendered order preserved:** the reference's flex rules give the dynamically inserted gallery `order: 0`. It therefore appears immediately after the hero, before the trust strip/parent concerns/mentor, despite the written intention to place it after the mentor. The integration reproduces that observed behavior. This is disclosed as an inherited reference defect, not silently redesigned.
3. **Stable grade truth:** raw HTML, metadata and generated controls now have correct 5–10 rules. The reference's hidden 1–4 options and runtime-only corrections are unnecessary. Visible sizes, spacing and interaction states remain matched. Calls to `setGrade(2)` clamp to 5.
4. **Private review is the environment boundary:** unlike V1's consent-off toggle, V2's full review gallery is visible within an explicitly labelled, loopback-only preview, as required to compare the reference. This does not approve any photo, voice, video, certificate detail or historical banner for publication.
5. **No public V2 artifact:** `build:v2` writes `.local-preview-v2/` only, requires an explicit private-review flag and refuses `NODE_ENV=production`. Originals are not copied to `dist/`. The old `build`/`preview` scripts still exercise the safe V1 production behavior; they are not V2 release commands. A final V2 production pipeline and approved media shortlist remain future work.
6. **Same fonts without network dependency:** DM Sans and Outfit are the exact downloaded reference WOFF2 files, not approximations. Only URLs changed. The comparison harness replays those same font responses for the untouched reference, avoiding network timing differences.
7. **Enquiry remains a demo:** class/concern/optional note stay in page memory. Copy occurs only on the user's Copy message click. No contact fields, persistent storage, POST/lead endpoint, WhatsApp destination, YouTube embed or analytics was added.

## Local commands

Node 22.12+ and Python 3 are available here. Runtime/build dependencies are installed with `npm.cmd ci`. Chrome is required by the browser configuration; the additional smoke uses installed Microsoft Edge. No dependency versions changed for V2.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open **http://127.0.0.1:5173**. Restart after source edits. For the retained V1 preview, use `npm.cmd run dev:v1 -- --port 5177`.

For reference comparison, run these in separate terminals:

```powershell
npm.cmd run dev:reference
npm.cmd run dev -- --port 5174
npm.cmd run compare:v2
npm.cmd run compare:v2:details
```

The reference command uses the already-extracted ZIP at `.review-baselines/v2-handoff/reference_site/` on port 4173. On another machine, first unpack the supplied ZIP there, preserving the reference folder layout. The third command writes private screenshots under `qa/visual/parity/`; reference is left, implementation is right in every `pair-*.png`.

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run test:browser
npm.cmd run test:v2
npm.cmd run test:browser:v2
npm.cmd run build:v2
```

The QA report explains the two expected-failure accessibility checks so a green Playwright exit is not mistaken for a clean accessibility audit. All owned servers are stopped after verification; run `dev` to start a fresh local preview.

## Public release approvals still pending

The full supplied checklist remains at [handoff-v2/docs/APPROVALS.md](handoff-v2/docs/APPROVALS.md). Pending items include original transparent logo/proportions, hero likeness/rights, board/subject/500+ claims and precise address/phone verification, approved mentor captions, genuine stories/reviews, guardian and creator permissions for each photo/video/voice, award facts, the final video shortlist and VID-04 edit/exclusion, lead-data/privacy workflow, and explicit domain/hosting/audience/publication authorization. Accessibility defects and media performance also need a Milestone 2 pass. No approval is inferred from a successful local build or visual match.
