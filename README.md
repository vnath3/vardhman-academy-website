# Vardhaman Academy V2

V2 is the active design for development and production. Static HTML, CSS and browser JavaScript; Node 22.12+ is used for builds and tests. There is no runtime server, framework or external font dependency.

## Local V2 review

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:5173. This loopback-only review includes the original private media and a review notice. Restart after source edits. It is separate from the public artifact.

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

Only assets with the exact `approved_for_public` status in `content/media-manifest.json` enter production. Currently zero assets have that status. Production therefore uses the existing text brand/neutral mentor placeholders and an empty gallery message, without requesting denied media. Local review keeps its full catalogue. Original media and approval statuses are unchanged.

Production code, fonts, font licences, approved media, `robots.txt` and Netlify `_headers` are packaged in `dist/`. Never publish the repository root or `.local-preview-v2/`. Rebuild after every media approval or revocation; the build clears stale output. The verifier rejects extra files, private catalogues, source mismatches and missing assets.

## Netlify

The root `netlify.toml` sets base `.`, publish directory `dist`, Node 22, and build command `npm run check && npm run build && npm run verify:production`. These checks run before Netlify publishes a successful artifact. No SPA rewrite is needed because navigation uses section anchors. A manual upload must contain the contents of the verified `dist/` at its root, including `index.html`.

No deployment was performed as part of this change. See [deployment-readiness report](docs/V2_DEPLOYMENT_READINESS.md) for verification evidence and remaining launch issues. Indexing stays disabled until the launch/SEO decision is made. A working production build does not fix the documented accessibility or content gaps.

## Source and regression checks

- `src/v2/`: current V2 HTML, styles, interactions, fonts and licences.
- `src/v2-media.mjs`: retained media presentation metadata; the builder filters it before writing browser data.
- `content/media-manifest.json`: media release allowlist; do not infer approval from the design decision.
- `scripts/build-v2.mjs`: production/private V2 packaging. `scripts/verify-production.mjs`: public artifact checks.
- `npm test`: V1 and V2 contracts plus production packaging/privacy regressions, run sequentially so V1 tests cannot leave `dist/` containing V1.
- `npm run test:browser:production`: tests the already-built production artifact in Chrome (1440/768/390/320px) and Edge (390px).
- `npm run test:browser:v2`: retained private V2 interaction/media regressions. `npm run test:browser`: retained V1 browser suite.
- `npm run dev:v1`: retained V1 preview. Its legacy builder remains `scripts/build.mjs`; running that file directly overwrites `dist/` with V1, so rebuild V2 afterwards. It is not used by Netlify or the production preview.

The enquiry remains a browser-only message preparation/copy demo, with no working admissions submission, WhatsApp destination, analytics or external video embed. Student stories are labelled illustrative. Original handoffs and historical QA are in `docs/handoff/`, `docs/handoff-v2/`, `docs/V2_INTEGRATION_REPORT.md` and `qa/V2_TEST_REPORT.md`; their Milestone 1 production-build descriptions are superseded by this README and the current readiness report.
