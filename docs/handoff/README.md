# Vardhaman Academy — Codex Handoff v1

Prepared: 2026-11-01. Status: **review package**, not a published website.

This ZIP contains the agreed design direction, real media selected from the owner's uploads, explicit publish restrictions, and a ready-to-paste task for Codex. It is **not** a complete website repository. The existing GitHub repository and live website were not modified while preparing it.

## Quick start

1. Give this entire ZIP to Codex alongside the existing website repository.
2. Ask Codex to read `CODEX_TASK.md` first, then `01-BRAND.md`, `02-UX-CONTENT.md`, `03-MEDIA-REVIEW.md`, and the two JSON files under `content/`.
3. Have Codex copy selected assets from `assets/` into the existing site's static public-media directory (proposed: `public/media/vardhaman/`). **Keep their filenames unchanged**.
4. Implement and test locally; do not publish, submit data, or deploy until the owner reviews the preview and the items in `APPROVALS.md` are resolved.

## Package layout

```
CODEX_TASK.md                 # Ready-to-copy engineering task
01-BRAND.md                   # Confirmed academy identity and style
02-UX-CONTENT.md              # Homepage content and UI decisions
03-MEDIA-REVIEW.md            # Catalogue, selection and use cases
APPROVALS.md                  # Things to verify before public launch
content/site-content.json    # Machine-readable content and sections
content/media-manifest.json  # Stable identifiers and relative asset paths
assets/brand/                 # Historical brand reference, NOT site photos
assets/hero/                  # Selected edited portrait (concept)
assets/mentor/                # Authentic, unedited seminar images
assets/gallery/               # Real sport / event photos
assets/review/                # Student award photos: approval required
assets/video/                 # Selected original event recordings
assets/video-posters/         # Still frames for lazy-loaded video cards
```

## Critical facts

- Exact name: **Vardhaman Academy** (with `a`).
- Founder/teacher: **Rushab Mutha**, referred to as Rushab Sir.
- **Current classes are 5th–10th only.** Historical posters mentioning 1st–12th or XI–XII are outdated. Never reuse those course claims.
- Parent-oriented, warm premium identity; primary blue and green with ivory surfaces.
- Preserve the original three-student/open-book logo from the supplied brand references. Do not redraw or AI-recreate the mark. Ask for an isolated original PNG/SVG if the site does not already have an exact logo.
- The edited hero is a **marketing composite** made from an authentic photograph at another school's seminar. Do not claim that seminar occurred at Vardhaman.
- Activity footage and award photos include minors. They are in the handoff for review, **not automatically cleared for public publishing**.

## Asset integration rule

The relative paths in the manifest use `assets/...` inside this ZIP. If assets are installed at `public/media/vardhaman/...`, remove the initial `assets/` portion when forming URLs:

`assets/hero/rushab-warm-hero-v1.png` → `/media/vardhaman/hero/rushab-warm-hero-v1.png`

Do not hardcode WhatsApp upload filenames or assume assets exist outside the ZIP.

## What this does not include yet

- An isolated high-quality original Vardhaman Academy logo file.
- Verified parent/student testimonials and transformation-story facts.
- Confirmed admission/WhatsApp form destination and current phone numbers.
- Evidence/permission for publishing identifiable children's photographs and video.
- A verified class schedule, fees, batch availability, or dates.

