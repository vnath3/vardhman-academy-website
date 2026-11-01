# Task for Codex: integrate Vardhaman Academy V2 with high visual fidelity

You are working in the owner's existing **Vardhaman Academy** website repository. The owner previously received a technically passing implementation that diverged dramatically from the original design because the reference HTML was absent. **Do not repeat that mistake.** The complete intended V2 is supplied in `reference_site/` within this ZIP.

## Scope and constraints

1. **Inspect, do not assume:** start by locating the actual website checkout (previously reported as `C:/A_Data/Git_projects/vardhman-academy-website`), inspect `git status`, current branches, existing code, tests, package scripts and any `AGENTS.md`. Never overwrite uncommitted work. If a path is different, find the actual checkout rather than creating a duplicate project.
2. **Preview both baselines:** run the owner's existing site and the bundled V2 reference locally on different ports. Capture desktop and mobile views of each. Record notable differences before editing.
3. **Integrate the real source:** use `reference_site/index.html`, `v2.css`, `v2.js`, and `media/` as the visual/behavioral source of truth. Adapt to the existing framework/build architecture where practical; retain useful existing tests and safe implementation work. Avoid replacing the whole repository unless owner explicitly approves.
4. **First milestone = visual and interaction parity.** Reproduce section order, hero, logo, colors, typography, cards, video gallery, gallery filters, student journey carousel, grade selector, Brain Spark quiz and four-step parent enquiry demo. Verify visually using side-by-side screenshots, not merely passing source/contract tests.
5. **Second milestone = defects and quality:** list bugs and test gaps separately. Fix reproducible functional defects and mobile/accessibility issues only after parity is established, and document behavior changes. Do not silently redesign sections to simplify implementation.
6. **Truthful content:** use official spelling **Vardhaman Academy**, current **Classes 5–10**, and parent-focused copy. Old posters showing 1–12 and XI–XII are historical, not current offers. Student story cards are illustrative placeholders; do not present invented stories, school board results or quotes as verified.
7. **Media:** preserve filenames/IDs and explicit asset paths. This archive includes real photos, video MP4 files and poster images. Avoid hotlinking to chat-hosted URLs. Keep unapproved student media local/private; do not upload to YouTube or a public asset bucket.
8. **No production actions:** do **not** push, deploy, publish, change the audience, connect analytics, connect WhatsApp or start collecting admission contact data unless the owner separately authorizes it. No official domain change.

## Requested deliverables

- A locally runnable implementation in the existing repository that closely matches bundled V2.
- `docs/V2_INTEGRATION_REPORT.md` recording reused/changed files, decisions, unresolved differences, and whether source and assets render.
- A **visual parity report** with reference versus implementation screenshots at minimum 1440px desktop and 390px mobile, each with section-by-section pass/fail notes. If taking screenshots with tools isn't possible, list the specific manual inspection steps and mark parity unverified.
- `qa/V2_TEST_REPORT.md` detailing functional, responsive, accessibility and media tests, commands, pass/fail results, and defects.
- A clear list of any privacy or content approvals still blocking public release.
- Exact local run commands and any environment setup requirements.

## Definition of done for Milestone 1

- The hero and brand presentation **visibly** match the reference, including the real symbol and Rushab Sir artwork.
- V2's original sections and their interaction states are present in the intended order; no editorial redesign is substituted.
- All included selected media resolve with no broken requests.
- Gallery filtering, media modal/video controls, story carousel, class 5–10 journey, quiz feedback and parent enquiry demo work locally.
- No current Grade 1–4, XI–XII or outdated poster offers appear as live course information.
- Desktop and mobile visual comparison is documented; remaining differences and defects are explicit.
- Existing repository changes are preserved, and no push/deployment occurred.

**Final reply format to owner:** parity summary; features integrated; QA results; remaining defects/approvals; commands to run; names of reports. Do not claim visual parity solely because contract tests passed.

