# Vardhaman Academy — Codex V2 integration handoff

**Deliverable:** a complete, locally runnable copy of the approved-direction **interactive V2 reference**, including the actual HTML, CSS, JavaScript, selected photographs and video files. **Target:** integrate it into the owner's existing GitHub website checkout and preserve existing work.

This ZIP fixes a critical omission in the prior handoff: the exact interactive reference HTML was not supplied, so the receiving implementation looked very different. In **this** package the real page is `reference_site/index.html`, and its associated `v2.css`, `v2.js` and `media/` are together with correct relative paths.

## First: preview the reference before implementing

From the unpacked ZIP directory, run one of:

```bash
python -m http.server 4173 -d reference_site
```

```powershell
py -m http.server 4173 -d reference_site
```

Open `http://127.0.0.1:4173/`. The V2 reference itself is a complete static demo. It does not need a build step or dependencies to render. **Do not** open `index.html` from a nested/rearranged folder because its stylesheet, script and media paths are relative.

**Recommended reading order for Codex**

1. [`CODEX_TASK.md`](CODEX_TASK.md) — requested integration work, boundaries and milestones.
2. [`docs/VISUAL_PARITY.md`](docs/VISUAL_PARITY.md) — non-negotiable appearance and interaction checklist.
3. [`docs/DECISIONS.md`](docs/DECISIONS.md) and [`docs/BRAND_AND_CONTENT.md`](docs/BRAND_AND_CONTENT.md) — confirmed naming, grades and truthful claims.
4. [`docs/MEDIA_CATALOG.md`](docs/MEDIA_CATALOG.md) and [`docs/APPROVALS.md`](docs/APPROVALS.md) — media IDs and publication restrictions.
5. [`qa/KNOWN_ISSUES.md`](qa/KNOWN_ISSUES.md) and [`qa/ACCEPTANCE_CRITERIA.md`](qa/ACCEPTANCE_CRITERIA.md) — defect disclosure and measurable completion.
6. [`docs/UX_REVIEW.md`](docs/UX_REVIEW.md) — the 20 UX principles as useful checks, not a mandate to redesign.

## Package map

```text
vardhaman-academy-v2-codex-handoff/
├── README.md                        ← This guide
├── CODEX_TASK.md                    ← Ready-to-use instruction for Codex
├── reference_site/
│   ├── index.html                   ← ACTUAL working V2 reference HTML
│   ├── v2.css                       ← V2 styling layer
│   ├── v2.js                        ← V2 interactions and content corrections
│   └── media/                       ← All SELECTED photos/videos/posters, exact paths
├── docs/
│   ├── DECISIONS.md
│   ├── BRAND_AND_CONTENT.md
│   ├── VISUAL_PARITY.md
│   ├── MEDIA_CATALOG.md
│   ├── UX_REVIEW.md
│   └── APPROVALS.md
├── qa/
│   ├── KNOWN_ISSUES.md
│   └── ACCEPTANCE_CRITERIA.md
└── tools/
    ├── check-handoff.mjs
    └── SHA256SUMS.txt               ← Integrity checks for package files
```

The archive intentionally does **not** contain the prior GitHub codebase; it was not available in this workspace. Codex should inspect that actual checkout before modifying it. The archive also intentionally excludes the Sites project's private deployment metadata and credentials.

## Safety and publication

This is a **private-owner design reference**, **not a cleared public release**. Several photos/videos depict identifiable children; no blanket guardian permissions have been confirmed. Do not publish, push media to a public repository, open a public preview containing those assets, or launch the official domain without explicit approval. Maintain private/local review boundaries.

The currently published V2 *review* Site is owner-private; a person signed in as the owner may compare to it. **Codex does not need remote access** to this Site because this ZIP contains its source and assets.

