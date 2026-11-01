# Vardhaman Academy V2 - Milestone 1

The active `npm.cmd run dev` command now opens the actual interactive V2 integration at http://127.0.0.1:5173. It is strictly a local/private review; no production release is configured for V2.

```powershell
npm.cmd ci
npm.cmd run dev
```

V2 checks: `npm.cmd run test:v2` and `npm.cmd run test:browser:v2`. Private review build: `npm.cmd run build:v2`.

Reports: [integration](docs/V2_INTEGRATION_REPORT.md), [visual parity](docs/V2_VISUAL_PARITY_REPORT.md), [QA and known defects](qa/V2_TEST_REPORT.md).

The original V1 implementation and tests are retained. Use `npm.cmd run dev:v1` for its preview; `test`, `test:browser`, `build` and `preview` retain their V1 meanings. The V1 README follows unchanged below, and its original `run dev` instruction should now be read as `run dev:v1`.

---

# Vardhaman Academy

Local review implementation of the supplied 2026-11-01 handoff. Nothing has been committed, pushed or deployed.

The supplied checkout was an unborn `master` branch containing only `.git`; `origin` also advertised no branches. There was no application, framework, existing logo or unrelated source work to preserve. This implementation uses static HTML generated from the supplied JSON, CSS and browser JavaScript, with a Node development/build toolchain. No runtime framework or external services are needed.

## Run locally

Use Node 22.12 or later. In PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open **http://127.0.0.1:5173**. Stop with Ctrl+C. Restart the command after source edits to regenerate the preview.

The local preview shows Option A for likeness review. The **Show media for private review** checkbox starts OFF. Turn it on to inspect the activity, achievement and external seminar catalogue. This serves only on the loopback interface, uses a same-origin review session and resets on page reload. Turning the checkbox off removes the media and revokes direct access to student images, videos, posters and resized copies. Historical reference posters never enter the gallery.

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run test:browser
npm.cmd run build
npm.cmd run preview
```

Production preview: **http://127.0.0.1:4173**. `build` writes only approved media into `dist/`. The supplied manifest currently approves **zero** assets for public release, so production uses a neutral mentor placeholder and an empty gallery. It contains no review checkbox and cannot enable private review. Both previews keep robots indexing disabled pending launch approval.

Browser tests use installed Google Chrome. If Chrome is unavailable, install a Playwright browser and adjust `launchOptions.channel` in `playwright.config.mjs` to use it. These development dependencies are not needed to host the static output.

## Content and media

- `content/site-content.json`: original content contract. Mentor details, board list, contact destinations and approved stories should be confirmed here before adding functionality.
- `content/media-manifest.json`: original stable IDs, filenames, categories and release status.
- `media/vardhaman/`: exact supplied originals, outside the public output. `assets/<rest>` maps to `/media/vardhaman/<rest>` at serve/build time.
- `src/sections.mjs`: semantic page sections and metadata. `src/styles.css`: responsive blue-green/ivory design. `src/app.js`: gallery filters, click-to-play, focus and pause behavior.
- `src/media.mjs`: path validation, release allowlist and gallery adapter. A media item's status must equal `approved_for_public` to enter a production build. Its poster and WebP derivatives inherit the same gate.
- `scripts/`: build, local serving, responsive image-copy generation and syntax checks. Originals are never overwritten. Local generated files live in `.local-preview/`; production files live in `dist/`.
- `docs/handoff/`: all original handoff documents, unchanged. [Approval checklist](docs/handoff/APPROVALS.md).
- `tests/`: content/path/build/access controls and browser smoke checks. Local screenshots are generated under ignored `test-results/`.

Original media and `docs/handoff` are private review material; a future static deployment must publish only `dist/`, never the repository root. A release approval is a content decision, not a file deletion: retain the original archive and update manifest statuses only after approval.

WhatsApp, admissions and YouTube are intentionally unconfigured. The primary CTA links to the informative contact section; no form, phone number, enquiry transmission, tracking, third-party font or external media embed is added. The isolated official logo remains missing, so the header uses a text label rather than a recreated symbol.

See [implementation and QA handoff](docs/IMPLEMENTATION.md) for results and remaining approvals. Do not publish until the owner reviews `docs/handoff/APPROVALS.md` and explicitly authorizes deployment.
