# V2 Batch 2: photo overlay, Rushabh and Classes 1–10

Date: 2026-11-14 (Asia/Calcutta). Owner requested verified fixes pushed in batches and confirmed the public spelling **Rushabh** and the current offer **Classes 1–10**. The owner chose to keep the authentic seminar background after discussing the proposed replacement, so no image edit or academy-event attribution was introduced.

## Changes

- Removed the dotted circular photo overlay through `.teacher-art::before`. The original seminar image and external-event caption are retained.
- Corrected active V2 headings, navigation, body copy, image descriptions, metadata and enquiry drafts to Rushabh Sir / Rushabh Mutha. Original filenames, source media and historical approval evidence are unchanged.
- Updated the hero, navigation, statistics, mentor section, FAQ, footer and SEO/share metadata to Classes 1–10.
- Extended the class journey and enquiry choices to all ten classes. Added generic learning-stage content for Classes 1–4, initial Class 1 state and 1/10 wraparound; removed the obsolete Class 5 floor/duplicate enhancement handlers.
- Quiz level labels now cover 1–4, 5–7 and 8–10. Existing questions and interactions are retained. Mobile journey choices use two rows of five within the same V2 styling.
- Retained the approved WhatsApp contact, ten gallery cards, all media approval states and noindex. Historical V1 sources/handoff documents remain unchanged.

## Verification

| Check | Result |
| --- | --- |
| JavaScript syntax | Passed |
| Contract/settings/build tests | 19/19 passed |
| Production build and verification | Passed: 35 files, 18 approved media files, 10 gallery cards, 31,347,935 bytes |
| Production browser suite | 37/37 passed: Chrome and Edge, including all ten classes, corrected spelling, overlay removal and lower-grade WhatsApp drafts |
| Private V2 browser suite | 12/12 passed on the full rerun |
| Retained V1 browser suite | 8/8 passed |
| Additional layout captures | Passed at 1440/390/320px: no horizontal overflow, ten journey/enquiry choices and grade buttons wider than 44px |

All **76 automated tests passed**. The first private run encountered transient missing preview files during a local preview rebuild (390px case); a full rerun passed without changing or weakening assertions. Production tests passed in the original run. No production build files were rebuilt while the production browser suite was active.

Regression assertions now cover all ten journey stages, clamping and wraparound; all ten enquiry choices; Classes 1 and 4 in encoded WhatsApp drafts; the new spelling, metadata and removal of the photo overlay. Browser coverage includes 1440/768/390/320px and installed Chrome/Edge. WhatsApp navigation and Analytics are intercepted during tests; no real message is sent. Screenshots remain in ignored local QA storage.

Visual evidence: [mobile photo without dotted overlay](../qa/visual/batch2/photo-390.png), [small-mobile class journey](../qa/visual/batch2/journey-320.png), [mobile enquiry choices](../qa/visual/batch2/enquiry-390.png) and [layout measurements](../qa/visual/batch2/layout.json). Fixed navigation overlays are hidden only for these section-detail screenshots; interaction tests exercise the actual navigation. The media manifest was compared against the prior commit: all 21 approval records, source/output paths and display slots are identical after excluding visitor-facing display-text fields.

The known Netlify-injected inline-script CSP warning, unverified factual copy, actual WhatsApp receipt, physical-device coverage and video caption/orientation review remain as previously documented. Noindex remains enabled. This batch changes no source image/video or approval status.
