# Implementation and QA handoff

## Current V2 production-readiness refinement - 2026-11-01

The existing static V2 website is retained in this repository. No deployment, commit, push or new media approval is included. The previously requested Google tag changes are preserved. The historical V1 implementation notes are retained below; their zero-media/no-analytics descriptions do not describe current V2.

### Enquiry workflow

`content/v2-settings.json` contains the owner-managed site URL, SEO settings and WhatsApp destination. The four-step wizard remains: class 5-10, learning concern, optional 350-character goal and a reviewable message. `src/v2/enquiry.js` generates the summary as text, supports edit/back/copy and opens WhatsApp only through an explicit button click after review.

The WhatsApp number is intentionally null until the owner supplies a public-contact-approved number. Set international digits without `+`, spaces or punctuation, set `number_approved` only after confirmation, and record `approved_by`, `approved_on` and `evidence`. Invalid destinations or missing approval evidence fail the build. Private review never opens a real WhatsApp destination. Legacy flyer numbers are not reused.

The draft stays in page memory. No names, phone fields, database, lead endpoint, persistence or automatic message submission was added. Privacy text explains that opening WhatsApp shares the draft with WhatsApp and that the parent must press Send there. Copying is reported only as copying; the site never claims delivery or successful submission. The draft URL is constructed inside a button action rather than placed in an outbound link attribute, to keep free text out of Google Analytics outbound `link_url` events. No enquiry text is passed to `gtag` or `dataLayer`.

WhatsApp format follows [the official click-to-chat guide](https://faq.whatsapp.com/5913398998672934). The analytics consideration follows [Google's enhanced-measurement documentation](https://support.google.com/analytics/answer/9216061?hl=en).

### Media and content

`content/v2-media-manifest.json` remains the sole V2 approval register. Its approved list is unchanged: LOGO-V2, HERO-A and IMG-12, including the owner's prior explicit consent confirmation for students embedded in IMG-12's projected display. No gallery image, video or poster was newly approved. Pending/rejected assets remain physically absent from `dist/`; gallery filters and controls work against the approved registry. All supplied media stays available only in the loopback private preview and its media-review index.

The five sample stories retain individual sample labels and their original carousel/dialog interactions. Section and modal copy now makes clear that they are illustrative rather than verified alumni accounts or promised outcomes. No testimonials, percentages, names, careers, contact details or award claims were invented. Board/subject, 500+ and precise address verification remain owner work. Historical banners remain excluded.

### SEO, sharing and indexing

Build-time metadata uses the configured title, description and canonical `https://va-academy.netlify.app/`. Open Graph metadata and a large-image sharing card reference the already-approved HERO-A. The favicon reuses the already-approved authentic logo PNG, so no new public image or missing favicon path is introduced. If these media permissions are revoked, the related sharing/icon references are omitted.

Indexing remains disabled. `seo.indexing_enabled: true` requires a completed `launch_approval` record. HTML robots metadata, robots.txt and Netlify's X-Robots-Tag are derived together from that validated setting. Private previews always remain noindex, even when a future production launch is approved. This does not change hosting or publish the site.

### Accessibility and build verification

`src/v2/dialogs.js` contains focus within gallery/story dialogs, makes the background inert and restores trigger focus on close. Existing Escape, pause and close controls remain. Enquiry choices expose pressed state; validation/status feedback is announced and step headings receive focus. The four progress dots have a named progressbar with the current step. Small-text colours were darkened within the V2 palette for contrast, including revealed sections and quiz feedback/results. The mentor section's existing single-column mobile rule was restored after a later desktop rule overrode it. Component shapes, typography and the desktop layout remain V2.

The production builder renders metadata/settings, retains the approved-media copy gate and produces the same static deployment structure. The verifier checks every declared script, style, font and media path, generated settings/metadata/robots/headers, exact approved output membership and source byte identity. Automated WhatsApp tests use a fictional example number and intercept all navigation; Google requests are stubbed during browser tests. No test contacts a parent or creates real Analytics traffic.

Final verification: 19 contract/settings/build tests, 17 production browser tests, 12 private V2 browser tests and 8 retained V1 browser tests passed. Additional local accessibility checks cover revealed content, story dialogs, quiz feedback/results and enquiry validation/review. Screenshots and local performance measurements are recorded in the report below; they do not replace production or physical-device review.

See [the current approval register](APPROVALS.md) and [concise refinement test report](V2_REFINEMENT_TEST_REPORT.md) for results and launch blockers. Prior design/media evidence remains in the V2 integration and restoration reports. Local commands remain `npm.cmd run dev` for private review and `npm.cmd run preview` after a verified build for the production artifact.

## Historical V1 handoff

Prepared 2026-11-01. Status: local review; no commit, push, external media upload, deployment or domain change.

## Repository audit and changes

The selected directory and its remote contained no source commits or branches. With no framework to reuse, a small static implementation was added in this same repository. If an earlier website exists elsewhere, its original source remains needed for comparison or integration; this implementation cannot demonstrate preservation of unavailable code or a missing logo.

All six handoff Markdown documents and both JSON contracts were read before source changes. The handoff's content and media restrictions were used as the implementation brief, within the user's explicit local-only scope.

- `src/sections.mjs`, `src/styles.css`: consistent Vardhaman Academy name, Classes 5–10, selected hero, mentor, parent concerns, explicitly proposed learning approach, honest journey/review placeholders, grouped gallery and informative contact section. Text logo until the original isolated logo is supplied.
- `src/media.mjs`, `src/app.js`: data-driven catalogue, exact original media URLs, All/Learning/Achievements/Activities/Seminars filters, lazy images, JPEG poster buttons, MP4 requests only after a click, native controls, inline video, natural aspect ratio, pause on another video/filter/tab hiding/scroll out of view. No historical poster or fabricated result enters the page.
- `scripts/`: static build, loopback-only preview, same-origin private review sessions, HTTP byte-range support and responsive WebP copies. The source JPEGs/MP4s/PNG and poster JPEGs remain unchanged.
- `content/`, `media/vardhaman/`, `docs/handoff/`: original supplied contracts, media and documents. Source originals deliberately sit outside the public build directory so they are retained without being released.
- `package.json`, lockfile, `.gitignore`, `playwright.config.mjs`, `tests/`, `README.md`: reproducible local setup, checks and documentation.

## Release behavior

Local mode displays the adult Option A composite for likeness review. The unchecked private media toggle grants no access to children, seminars, awards or their thumbnails. Enabling it makes 11 review cards available (2 seminar images, 2 activity photos, 2 award images, 5 videos); the hero remains separate. Reference-only items are never displayed.

Production mode includes only assets explicitly marked `approved_for_public`. None in this handoff have that status. `dist/` therefore contains no media files or private catalogue records; the hero is replaced by a neutral mentor placeholder, the gallery is empty, and private review cannot be enabled. Direct URLs, including derivative and poster URLs, cannot bypass the production gate. Indexing remains disabled pending approval.

## Verification

| Check | Result |
| --- | --- |
| `npm.cmd run check` | Passed JavaScript syntax checks. |
| `npm.cmd test` | 6/6 contract, file-path, public-build and HTTP access-control tests passed. |
| `npm.cmd run test:browser` | 8/8 Chrome browser tests passed. Responsive widths: 320, 390, 768 and 1440 pixels; no horizontal overflow. |
| Accessibility | No axe WCAG A/AA violations detected in the four responsive layouts or enabled private gallery; keyboard skip link, toggle, filters, CTA and reduced-motion behavior checked. |
| Media | All private photos/posters load; all 5 MP4s decode. Click-to-play, mutual pause, pause out of view, toggle revocation, reload reset and VID-04 start/end orientation checked. No MP4 request before a play click. |
| `npm.cmd run build` | Passed. Production contains only `index.html`, `styles.css`, `app.js`, `catalogue.json` and `robots.txt`; zero public media and zero catalogue items. |
| ZIP integrity | All 28 supplied files match SHA-256 against the ZIP, including all 20 original media files, both JSON contracts and 6 handoff documents. |
| `npm.cmd audit --audit-level=low` | 0 vulnerabilities. |
| Documented local command | `npm.cmd run dev` served `/`, `/catalogue.json` and the hero WebP with HTTP 200; the unapproved cricket original returned 404 with review OFF. Owned preview servers were stopped after verification. |

Desktop/mobile screenshots and VID-04 beginning/ending frames are available locally in ignored `test-results/`. Visual inspection confirmed the warm layout, intact face/hand placement and the original clip's camera turn. The 960px hero WebP is 51,950 bytes versus the unchanged 2,119,470-byte PNG; 480px and 1440px variants are also generated. This is an image-size improvement, not a full performance benchmark.

Browser checks use installed desktop Chrome with mobile/tablet viewport emulation; physical-device testing, Safari and Firefox are not covered. Automated axe checks supplement, rather than replace, a human accessibility review. No standalone linter was present in the empty repository; `npm.cmd run check` performs JavaScript syntax checks. Speech/caption accessibility of the source clips still requires human review before release.

## Remaining approvals and launch blockers

The original [APPROVALS.md](handoff/APPROVALS.md) remains unchanged and must be confirmed by the owner before any public deployment.

1. Rushab's facial-likeness approval for the AI-edited Option A marketing composite. The selected style is approved; public likeness approval remains pending in the manifest.
2. Original isolated official PNG/SVG logo, or the exact former website logo asset. No mark was extracted, redrawn or invented.
3. Board list, full address, accurate phone numbers, batches/timings/fees/availability and any proposed historical statistics or scholarships. Only the confirmed locality and Classes 5–10 appear.
4. Guardian consent for identifiable activity/award photos, all five videos and their thumbnails; award facts and academy attribution for IMG-18/19. Historical event banners remain excluded.
5. Rights and accurate external-seminar captions for IMG-09/12; mentor introduction and proposed teaching approach confirmation.
6. Verified student journeys and first-hand parent/student accounts with permission. There are no invented quotes, names, percentages or careers.
7. Approved WhatsApp/admissions destinations and personal-data workflow, including privacy notice. No data collection is implemented. YouTube upload/embedding remains unconfigured.
8. VID-04 is encoded portrait (576 × 1024, about 53.65 seconds). Visual inspection at 1s and about 51.65s confirms a camera turn within the original recording: the ending is sideways. Playback preserves it with `object-fit: contain`. Approve a trimmed/edited derivative or an exclusion before release; a global rotation would spoil the upright beginning. Review all clip audio and provide captions/transcripts where needed before public video approval.
9. Owner's final desktop/mobile, accessibility, speed and SEO review, then explicit publication/domain authorization. A verified canonical URL and final indexing settings should be set at that point.

## Local preview commands

```powershell
npm.cmd ci
npm.cmd run dev
```

Visit http://127.0.0.1:5173. Use the header checkbox only for local private media review. Production behavior can be inspected with `npm.cmd run build` followed by `npm.cmd run preview` at http://127.0.0.1:4173. All servers bind only to loopback.
