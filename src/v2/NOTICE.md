# V2 source provenance

`index.html`, `base.css`, `concept.js`, `v2.css` and `v2.js` derive from the owner's actual `reference_site/` in `vardhaman-academy-v2-codex-handoff.zip`. The original inline style and behavior were split into external files without redesigning them. The untouched reference is retained locally under `.review-baselines/v2-handoff/reference_site/`.

Changes for this integration: stable academy spelling and Classes 5–10 in source, grade selectors restricted at creation rather than hidden/removed after creation, local font URLs, and noindex metadata. `v2.css` retains the reference rules and original flyer crop. Gallery imagery and video retain exact names/IDs and are served from the byte-identical V1 archive at the reference's `./media/` URLs.

DM Sans and Outfit WOFF2 files are the exact Latin subsets returned to Chrome by the reference's Google Fonts stylesheet. Their original face declarations are retained in `fonts.css`; only the URLs changed to local paths. Upstream SIL Open Font License files accompany both fonts in `fonts/`. No student media was sent to Google Fonts or any other service.

This source and all imagery remain a private review. The historical flyer crop, hero likeness, student/guardian permissions and factual claims still require launch approvals. Inherited visual/interaction/accessibility defects are listed in the integration and QA reports; Milestone 1 does not silently redesign them.
