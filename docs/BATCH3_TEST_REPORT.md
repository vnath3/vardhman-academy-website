# V2 Batch 3: production content, compact gallery and browser refinements

Date: 2026-11-14 (Asia/Calcutta). The owner requested these changes, committing/pushing and production deployment. This report distinguishes completed local checks from the remaining content/device work; indexing remains disabled.

## Placeholder and content inventory

| Previous public content | Final treatment |
| --- | --- |
| 500+ TAUGHT, academy-attributed 500+ line, statistics strip and mentor's 500-student biography | Consistently updated to **5,000+** as explicitly supplied by the owner. Removed the draft-style attribution qualifier. This is an owner-provided count, not an independent records audit. |
| Five illustrative alumni/career stories, sample labels and replacement promises | Entire section, modal and navigation links are excluded from production HTML; sample narratives/carousel code are excluded from production JavaScript. Remain available only in private review. No fictional story is relabelled as a real alumnus. |
| Reserved student-voices/reviews box | Removed; no unverified praise or placeholder review card is public. |
| Mentor's final-page/story promise and future photo/review note | Replaced with a concise biography and invitation to discuss the child's needs. |
| Hero photograph “will appear here” and “real classroom photo belongs here” source placeholders | Removed. Approved photographs are rendered in HTML at build time; revoked/missing permissions produce only neutral mentor identity text. The real external-event caption is retained. |
| Approach intro awaiting final launch/method confirmation | Replaced with neutral concepts/confidence/study-habits copy, without inventing methods or outcomes. |
| “Make it interactive” journey heading | Replaced with “Explore each class”. |
| FAQ concept qualifier and future map-pin promise | Removed. Subject/board options and directions are confirmed through the existing enquiry path; no street address or map was invented. |
| Universal “All subjects / All boards” badges/footer text | Replaced with subject-support wording and confirmation guidance while the detailed offer remains unverified. |
| “Interactive concept preview” footer | Removed. |

Retained deliberately: useful textarea example text, truthful unavailable-contact/empty-filter/error states, privacy/manual-send messaging and the external-seminar disclosure. These describe actual controls or limitations. Private-review notices remain private. Original handoffs and V1 history remain unchanged.

## Interaction and browser changes

- Gallery initially shows one row: 3 desktop, 2 tablet, 1 mobile card. View all / Show fewer operates within the selected category, with `aria-expanded`, a live count, filter resets, resize handling and focus retention. All ten approved cards remain accessible; no video is fetched just by expanding the gallery.
- Icons use scoped transform-based animation, consistent emoji boxes and pointer-free decorations. Pause/resume is available; reduced-motion settings disable animation instead of cycling an effectively zero-duration loop. See [W3C motion guidance](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) and [reduced-motion guidance](https://www.w3.org/WAI/WCAG22/Techniques/css/C39).
- Firefox diagnostics reproduced a 109px horizontal native scroll inside the decorative journey panel after focus. Non-scrolling clipping prevents that displacement. Regression measurements isolate icon movement from page scrolling/reveal transitions and verify containment, pause/resume, class changes and reduced motion.
- Navigation labels center vertically/horizontally and wrap at word boundaries. Tablet widths up to 1050px use the existing menu style; dropdown labels are centered with full-width targets. Tests cover 320, 390, 768, 820, 1024, 1051, 1100, 1280 and 1440px.
- Private carousel regressions are retained in the private suite. Public regressions instead verify that samples and their links are absent. Existing gallery playback, class selector, quiz, FAQ, enquiry, keyboard, accessibility and media-isolation checks remain.

## Verification

| Check | Result |
| --- | --- |
| Syntax and production build/verifier | Passed; current artifact has 35 files, 18 approved media files, 10 gallery entries and 31,343,808 bytes |
| Contract/settings/build regressions | 21/21 passed |
| Focused Firefox/WebKit checks | 10/10 passed (5 Firefox, 5 Windows WebKit); gallery, motion, nine navigation widths and no page errors |
| Chrome/Edge production regressions | 45/45 passed (32 Chrome, 13 Edge); approved photos/videos, collapsed/expanded filters, copy cleanup, enquiries, FAQ, classes, navigation, motion, accessibility and Analytics/CSP |
| Private V2 regressions | 17/17 passed, including all original carousel controls/focus/resize tests retained in private review |
| Retained V1 regressions | 8/8 passed |

All **101 automated tests passed**. Local production screenshots: [desktop](../qa/visual/production/Chrome-1440.png), [tablet](../qa/visual/production/Chrome-768.png), [mobile](../qa/visual/production/Chrome-390.png) and [small mobile](../qa/visual/production/Chrome-320.png). These screenshots and test traces remain in ignored QA storage outside deployment output. They use reduced motion intentionally; normal-motion animation is verified separately by observing movement, pausing/resuming and changing device preferences.

All source photos/videos, manifest permissions, source/output media paths, WhatsApp contact, fonts, canonical URL and noindex setting are unchanged. Browser tests intercept Analytics and WhatsApp; no real enquiry is sent. Earlier regression runs caught and corrected a FAQ selector error introduced while separating private-only code; the final runs include actual FAQ interaction and page-error assertions.

## Remaining work

1. Supply verified, permissioned testimonials/alumni stories if that section is to return publicly.
2. Confirm a full street address/map pin, detailed subjects/boards, fees, timings and actual admissions availability before adding them. Current public copy does not promise missing details.
3. Owner to verify receipt of an actual WhatsApp enquiry. Automated checks stop at an intercepted, correctly encoded handoff.
4. Human review of clip audio/captions/transcripts and the approved VID-04 sideways ending. No source footage was edited in this batch.
5. Media performance work: the unchanged 2.1 MB hero and original videos remain large. Collapsing the gallery limits initial presentation/lazy loading; this is not a field Core Web Vitals claim.
6. Existing Netlify-injected inline-script CSP warning remains separate from application functionality. Review/disable that platform injection or configure it deliberately; script security was not weakened.
7. Physical Android/iOS, actual Safari and manual assistive-technology review remain outstanding. Windows WebKit verifies engine behavior but is not an actual Safari/iOS device; its font-weight rendering differs from Chrome in local diagnostics, so visual signoff remains needed. Font binaries/styles were not changed.
8. Explicit indexing approval is still pending. The site remains noindex even after deployment.
