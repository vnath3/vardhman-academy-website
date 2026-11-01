# Vardhaman Academy V2

V2 is the active design for development and production. Static HTML, CSS and browser JavaScript; Node 22.12+ is used for builds and tests. There is no runtime server, framework or external font dependency.

## Local V2 review

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:5173. This loopback-only review includes the original private media and a review notice. All supplied originals, including unused/rejected references, are accessible at http://127.0.0.1:5173/media-review.html. That index never enters production. Restart after source or manifest edits. It is separate from the public artifact.

## Production build and verification

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run verify:production
npm.cmd run test:browser:production
npm.cmd run preview
```

`npm run build` and `npm run build:v2` both build V2 into `dist/`. `npm run preview` serves the existing `dist/` at http://127.0.0.1:4173; it never rebuilds or serves the source media archive. `npm run build:review:v2` creates the separate `.local-preview-v2/` review artifact. Private review is refused when `NODE_ENV=production`.

V2 uses `content/v2-media-manifest.json` as its authoritative media inventory and approval register. Only `approval_status: "approved"` records with every required verification completed and an approval record can enter production. The approved logo-only crop, HERO-A and IMG-12 are restored. Gallery assets remain pending or rejected, so the public gallery retains its empty state. The legacy `content/media-manifest.json` is retained solely for V1 regression. All 20 original handoff media files remain unchanged.

Production code, fonts, font licences, approved media, `robots.txt` and Netlify `_headers` are packaged in `dist/`. Never publish the repository root or `.local-preview-v2/`. Rebuild after every media approval or revocation; the build clears stale output. The verifier rejects extra files, private catalogues, source mismatches and missing assets.

## Netlify

The root `netlify.toml` sets base `.`, publish directory `dist`, Node 22, and build command `npm run check && npm run build && npm run verify:production`. These checks run before Netlify publishes a successful artifact. No SPA rewrite is needed because navigation uses section anchors. A manual upload must contain the contents of the verified `dist/` at its root, including `index.html`.

No deployment was performed as part of this change. See the current [refinement test report](docs/V2_REFINEMENT_TEST_REPORT.md) and [approval register](docs/APPROVALS.md) for checks and launch blockers. The [media restoration report](docs/V2_MEDIA_RESTORATION_REPORT.md) retains approval records and before/after visual evidence. The earlier [pipeline readiness report](docs/V2_DEPLOYMENT_READINESS.md) is historical; its zero-media counts are superseded. Indexing stays disabled until explicit launch approval.

## Source and regression checks

- `src/v2/`: current V2 HTML, styles, interactions, fonts and licences.
- `src/v2-media.mjs`: manifest validation and public/private media planning; no hardcoded gallery IDs or display catalogue.
- `content/v2-media-manifest.json`: V2 source/output paths, placement, captions, poster relationships, approval states, required checks and approval evidence. Change this manifest to activate future approved photos/videos; no gallery JavaScript edit is needed. Approve a video and its linked poster individually. Never infer guardian consent from design approval.
- `content/v2-settings.json`: owner-approved WhatsApp destination, canonical URL, SEO metadata and launch/indexing approval. See [implementation details](docs/IMPLEMENTATION.md) before activating a contact or indexing.
- `scripts/build-v2.mjs`: production/private V2 packaging. `scripts/verify-production.mjs`: public artifact checks.
- `npm test`: V1 and V2 contracts plus production packaging/privacy regressions, run sequentially so V1 tests cannot leave `dist/` containing V1.
- `npm run test:browser:production`: tests the already-built production artifact in Chrome (1440/768/390/320px) and Edge (390px).
- `npm run test:browser:v2`: retained private V2 interaction/media regressions. `npm run test:browser`: retained V1 browser suite.
- `npm run dev:v1`: retained V1 preview. Its legacy builder remains `scripts/build.mjs`; running that file directly overwrites `dist/` with V1, so rebuild V2 afterwards. It is not used by Netlify or the production preview.

The four-step enquiry wizard prepares an editable summary, supports copying and opens WhatsApp only after an explicit action when an approved number is configured. The number currently remains null pending owner confirmation; copying never reports a submission. Private review disables real WhatsApp destinations. Drafts are not stored or sent to analytics. No backend lead submission or external video embed is configured.

Production includes the Google tag `G-4F7P27EQSF`; private V2 review builds omit it. The initializer is in `src/v2/analytics.js`, and the production CSP permits the [Google Analytics endpoints](https://developers.google.com/tag-platform/security/guides/csp#google_analytics). Browser tests stub Google requests so test visits do not reach the live property. Student stories are labelled illustrative. Original handoffs and historical QA are in `docs/handoff/`, `docs/handoff-v2/`, `docs/V2_INTEGRATION_REPORT.md` and `qa/V2_TEST_REPORT.md`; their Milestone 1 production-build descriptions are superseded by this README and the current readiness report.
