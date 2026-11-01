# Paste this into Codex with the ZIP and the existing website repository

You are implementing the next **review-ready** iteration of the Vardhaman Academy website based on this ZIP. Read all the docs and JSON under this ZIP before modifying the repo. This ZIP is authoritative for new *agreed* decisions. Inspect the existing project first and **reuse its current framework and architecture**. Do not create a new unrelated site or force a framework migration.

## Scope and priorities

1. Make the official name `Vardhaman Academy` consistent in page title, logo label, navigation, content, SEO and image alt text.
2. Correct ALL current programme text to `Classes 5–10`. Remove old `1–10`, `1–12`, `XI–XII` offers unless explicitly marked in an internal historical reference.
3. Adapt the homepage hero to the copy in `02-UX-CONTENT.md`, using the selected `HERO-A` from `assets/hero/rushab-warm-hero-v1.png` and the established warm, calm blue-green palette. Preserve exact logo; ask for the original file if necessary, use text temporarily rather than redrawing its mark.
4. Create an attractive, accessible `Beyond Books` photo/video gallery with section grouping and click-to-play video thumbnails; include a simple data-driven media catalogue based on `content/media-manifest.json`. **Do not publicly show items with `publish_status` other than `approved_for_public`**. Consent-required student media can be previewed only behind a locally controlled private review toggle that is OFF in production builds. Avoid obscuring the archive by deleting the files.
5. Add `Meet Rushab Sir`, a parent-empathy section and verified-content placeholders for future student journeys/reviews, but do not invent testimonials, school results, scholarships or alumni biographies.
6. Keep WhatsApp/admissions/YouTube integration as placeholders clearly identified in code and the handoff; do not submit enquiry data, launch a public video upload or publish without approved destinations.

## Asset deployment

- Copy `assets/` preserving its subfolder names and filenames to a static directory such as `public/media/vardhaman/` (adjust to the project's framework).
- Use the exact paths in `content/media-manifest.json` to drive gallery cards and captions. Expected URL formula: `assets/<rest>` inside ZIP maps to `/media/vardhaman/<rest>`.
- For each MP4 use a matching JPEG from `assets/video-posters` for its poster frame. Lazy-load media; pause videos when not in use; have accessible play controls. Respect natural video aspect ratio and orientation; check VID-04 carefully.
- Do not show the historical posters or student awards as verified public content.
- Keep source JPEGs unchanged and use non-destructive resizing/web optimisation only for copies.

## Design quality

The emotional intent is calm parental trust, not entertainment hype. Use generous whitespace, readable text, restrained micro-interactions, mobile-first responsive layout, semantic HTML, meaningful image alt text, keyboard accessibility and `prefers-reduced-motion`. Prioritise trust and mentor connection above a wall of marks.

## Acceptance criteria

**Input**
- Given this ZIP, current repo and `content/` contracts.
- No missing-path assumptions, fake data, silent brand replacements or external uploads.

**Process**
- Audit existing site, make focused changes, preserve unrelated repo work.
- Implement modular sections and asset-data adapter that is easy to update when more photos or student stories arrive.
- Add/regress tests for academy name, grades 5–10, correct media paths and public-media gating.
- Run available build/lint/tests and responsive smoke checks.

**Output**
- A local, previewable site showing Option A hero and credible parent-facing content.
- Activity gallery structure and media loading working; student images/videos remain unpublished until consent.
- A summary: files changed, test results, missing approvals, exact local preview command and production readiness blockers.
- **No commit, push, deployment, domain change or public release without the owner's explicit request.**

## Final review checklist

Ask the owner to confirm `APPROVALS.md` before any public deployment. If media permissions are unknown, keep real child media in the package but out of the public build. If some asset path is missing or a logo needs extraction, surface a blocker and do not substitute an invented one.

