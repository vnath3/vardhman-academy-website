# V2 production build and Netlify deployment readiness

Date: 2026-11-01 (Asia/Calcutta).

## Decision

**The V2 production pipeline is verified locally and configured for Netlify. No deployment was performed.** The output can be hosted as a static site, but the remaining accessibility, content and enquiry limitations below prevent an unconditional claim of public launch readiness.

V2 remains the approved design direction. The original sections, typography, colours, layout, story carousel, class journey, Brain Spark quiz, navigation and message-preparation demo are retained. No design refresh was performed. The only visible production differences from private review are removal of review-only notices and replacement/exclusion of media without public approval.

## Build and hosting changes

- `npm run build` and `npm run build:v2` now run `scripts/build-v2.mjs` in production mode, writing V2 to `dist/`. Production works with `NODE_ENV=production`; it does not require the legacy V1 image-processing dependency.
- The build copies V2 HTML, CSS, JavaScript, both locally hosted WOFF2 fonts and their licences. It generates `media-data.js`, `robots.txt` and Netlify `_headers`, then copies only approved media used by V2.
- The output directory is cleared on each build, so a revoked approval cannot leave an old image, video, poster or V1 file available in a subsequent artifact.
- `npm run verify:production` verifies the complete file allowlist, source equality, generated public catalogue, media bytes, HTML/CSS references, font paths and headers. Unexpected/stale files and missing dependencies fail verification.
- `npm run preview` serves the existing `dist/` at `http://127.0.0.1:4173`. It does not rebuild, mount the source archive or expose private-review endpoints. Missing paths return actual 404 responses, including `/v2`; the V2 website is served at `/`.
- The root `netlify.toml` uses base `.`, publish `dist`, Node 22 and `npm run check && npm run build && npm run verify:production`. A failed build or artifact check prevents that Netlify build from publishing. Browser regression tests are local checks requiring installed Chrome/Edge; they are not silently assumed to run in Netlify's Linux build image.
- Netlify receives CSP and related headers through `dist/_headers`. Local production preview applies the same headers. Inline styles remain allowed because the existing V2 uses inline presentation styles; scripts, fonts and media stay on the same origin, and form submission is disabled.
- Navigation uses `#section` anchors, so no catch-all SPA rewrite was added. Such a rewrite could conceal missing asset errors without fixing an incorrect publish directory.

Configuration reference: [Netlify file-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/). For the reported root 404, see [Netlify missing index/publish-directory troubleshooting](https://docs.netlify.com/resources/troubleshooting/page-not-found-error-guide/).

## Media release policy and current artifact

`content/media-manifest.json` remains unchanged. An asset must have the exact status `approved_for_public`; the design-direction approval does not change individual media permissions. Currently **zero** assets qualify.

The current production artifact therefore contains **zero student photos, videos, posters, mentor photographs or hero composites**. The historical brand flyer is also excluded. The original V2 text brand and neutral mentor placeholders occupy the existing layout; the gallery displays a permission-aware empty state. Filters still respond. Private-review notices do not appear in the public page, and no excluded media URLs are requested by the browser.

Gallery metadata is retained outside the published source directory in `src/v2-media.mjs`. Only permitted records enter generated `media-data.js`. Approval is enforced during packaging, rather than by merely hiding cards in the browser. Video posters inherit their video's gate; denied shared files cannot gain access through another approved record. Unsafe filesystem paths, duplicate media IDs and approved videos without an approved poster fail the media-plan check. Media archives and handoff documents never enter `dist/`.

The loopback private preview at `http://127.0.0.1:5173` remains available through `npm run dev`, including all original review media and interactions. `npm run build:review:v2` creates `.local-preview-v2/` and refuses production environments. Never publish that directory or the repository root.

After permission is recorded, update the asset's manifest status and its presentation/caption details as needed, rebuild, and run the full verification sequence. Approval revocation also requires a new build and deployment to remove the previously hosted file; it cannot remove copies already downloaded by visitors.

## Verification evidence

Environment: Windows, Node 22.12.0, npm 11.11.0, installed desktop Chrome and Edge. No dependencies were added.

| Check | Result |
| --- | --- |
| `npm run check` | PASS: recursive JavaScript syntax checks, including nested V2 and browser test files. |
| `npm test` | PASS: 13/13 V1, V2 and production contract/regression tests. |
| Isolated production fixture build | PASS: native Node build outside the repository, without installed dependencies; synthetic approved image, hero, video and poster copied correctly. No real student's release status was changed. |
| Revocation/stale-file regression | PASS: rebuilding after fixture revocation removes the formerly public files; verifier rejects an injected stale file. |
| Missing approved source regression | PASS: build exits unsuccessfully rather than silently creating a broken release. |
| Production build and artifact verifier | PASS: 13 files, 183064 bytes total, zero public media files and zero gallery records. Includes two font binaries and two licence files. |
| Production HTTP checks | PASS: `/` returns V2; fonts have the correct MIME type and range support; source/archive/private endpoints and unknown paths return 404; POST is refused. |
| Production browser regression | PASS: 5 functional runs (Chrome at 1440/768/390/320px, Edge at 390px). No page asset failures, JS errors, CSP violations, external requests or excluded-media requests; no horizontal overflow. |
| Production interactions | PASS: menu/anchors, all empty-gallery filters, classes 5?10 and wraparound, quiz completion/reset, story filter/modal/Escape/focus return, parent-demo validation/summary/clipboard/reset and FAQ. No enquiry submission or persistent browser storage. |
| Private V2 browser regression | 10 functional runs PASS; 2 documented accessibility failures reproduced as expected failures. Playwright reports `12 passed`; that does not mean accessibility passes. All five original videos still decode/play locally. |
| Retained V1 browser regression | PASS: 8/8 checks. |
| Production accessibility audit | FAIL (known, expected): default-state axe WCAG audit reports `color-contrast`, 5 affected nodes. Playwright reports 6 passed because this one failure is explicitly expected alongside the 5 successful functional runs. |
| Visual review | Desktop and phone production screenshots inspected; neutral placeholders retain V2's layout. Private V2 section/media/browser checks pass. No new full pixel-parity comparison was run. |
| Hosted Netlify verification | NOT RUN: no deployment, hosted URL check, remote build-log review or Netlify account-setting change. |

Private local screenshots/audits are under ignored `qa/visual/production/`, with diagnostic traces in ignored `test-results-production/`. The production audit is `qa/visual/production/axe.json`. These files are local QA evidence and are not deployment assets.

## Remaining issues

1. **Accessibility:** inherited contrast failures remain. The existing gallery and story dialogs lack complete focus containment/background inertness. The gallery is empty in the current production artifact, but its dialog defect would matter once media is approved; the story dialog remains available. Escape and focus return work. The existing sticky mobile CTA can overlap page content, and the large desktop heading puts the main hero CTA below a 900px first screen. These were not redesigned during build work. See `qa/V2_TEST_REPORT.md` for the original defects and broader limits.
2. **Content and contact:** verify the 500+ claim, subjects/boards, mentor copy and exact address. Stories remain explicitly illustrative. The parent enquiry is a message preparation/copy demo with no admissions endpoint, public phone number or working WhatsApp destination. It must not be presented as a live lead submission.
3. **Brand/media:** the original transparent logo, hero likeness approval, external-seminar captions/rights, student guardian permissions and award verification remain outstanding. No media permissions were inferred or granted. Before any approved video release, review captions/transcripts, missing-video feedback and the existing VID-04 rotation issue; optimise large media without changing the approved visual design.
4. **Indexing:** existing HTML noindex metadata, robots disallow and `X-Robots-Tag` are retained. Review all three together during the launch/SEO decision. They are indexing controls, not authentication or access protection.
5. **Browser/device coverage:** desktop Chrome/Edge with emulated viewport sizes were tested. Safari/iOS, Firefox, physical phones, screen readers, slow networks and production Core Web Vitals remain unverified. The current artifact has no public video, so actual hosted video playback/range behaviour must be checked when one is approved.
6. **Favicon:** no favicon was supplied or added; a browser may request `/favicon.ico` and receive a 404. This is separate from the homepage error and does not affect page loading.
7. **Remote configuration:** the original live 404 cannot be conclusively tied to a specific deployed folder without its URL/build log. The repository now supplies the required root index and correct publish directory; the eventual Netlify deployment must use this repository revision and the intended branch/configuration.

## Reproduce before deployment

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd test
npm.cmd run test:browser
npm.cmd run test:browser:v2
npm.cmd run build
npm.cmd run verify:production
npm.cmd run test:browser:production
npm.cmd run preview
```

The legacy V1 tests are preserved and can temporarily build V1 into `dist/`; `npm test` runs the files sequentially and ends with the V2 production regression rebuilding that directory. Always perform the final V2 build and verification shown above before reviewing or uploading the artifact. The legacy builder `node scripts/build.mjs` is retained for V1 regression purposes and is not the deployment entrypoint.

On the eventual Netlify deployment, confirm `/index.html` appears at the deploy root in Deploy File Explorer, open the root URL and section anchors, and check fonts, CSP and media responses. For manual deployment, upload the verified `dist/` contents with `index.html` at its root. No public deployment is included in this readiness result.
