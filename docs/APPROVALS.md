# Current V2 approvals and launch blockers

Updated 2026-11-01. This current register supersedes historical checklist states; original handoff files remain unchanged.

## Recorded owner approvals

- [x] Preserve the V2 design and Classes 5-10 in the existing repository.
- [x] LOGO-V2: authentic pixel-preserving logo-only crop; full historical flyer excluded.
- [x] HERO-A: edited Rushab Sir portrait, likeness/publication rights confirmed.
- [x] IMG-12: original external-seminar image, rights and guardian consent for every embedded student confirmed. Preserve truthful external-event context.
- [x] Google tag G-4F7P27EQSF requested; implementation remains in production builds only.
- [x] Implement a configurable WhatsApp draft handoff requiring explicit parent action. This authorizes the workflow, not an unconfirmed contact number.

## Still needed from the owner

- [ ] Supply the full international WhatsApp number and explicitly approve it for public parent enquiries. Record that approval in `content/v2-settings.json`; keep the button unavailable until then.
- [ ] Confirm the number belongs to the intended academy contact, can receive WhatsApp messages and has been tested end to end by the owner.
- [ ] Supply an individual approved gallery asset list with usage/guardian permissions for each photograph, video and linked poster. No new asset list was supplied in this task. Existing media states remain unchanged.
- [ ] Verify IMG-18/19 award details/academy attribution; review clip audio/captions and VID-04's sideways ending before approving any release.
- [ ] Verify the 500+ claim, subjects/boards, full address, actual admissions availability and teaching commitments.
- [ ] Provide verified, permissioned stories/testimonials if illustrative cards are to be replaced. Current sample labels must stay until then.
- [ ] Review draft privacy wording, operational handling of enquiries and public usage analytics with the owner responsible for the site.
- [ ] Provide a square master favicon/isolated logo if desired. The current favicon uses only the already-approved logo PNG.
- [ ] Review physical mobile devices, Safari/iOS, Firefox, screen readers, slower connections and production Core Web Vitals. Local automated checks are not that coverage.
- [ ] Explicitly approve launch/indexing. Only then record `seo.launch_approval` and enable `seo.indexing_enabled`; the build updates HTML, robots.txt and headers together. Noindex stays on for now.
- [ ] Authorize any commit, push or deployment separately. None is performed by this refinement.

Current approved public asset IDs are **LOGO-V2, HERO-A, IMG-12** only. The gallery remains empty in the public artifact until individual approvals are recorded. Private review at `http://127.0.0.1:5173/media-review.html` retains all supplied originals. Do not interpret successful QA or a configured draft destination as permission to publish pending media.
