# V2 visual and interaction parity specification

**Reference:** run `reference_site/index.html` using a local web server, alongside its `v2.css`, `v2.js` and `media/`. This is the **actual** V2, not an illustrative wireframe or mood board.

## Brand and layout

- The logo includes the **intact official blue-green educational symbol and Vardhaman Academy wordmark**. In V2 it is shown using a CSS crop of `media/brand/legacy-brand-poster-img-01.jpeg`; prefer a supplied original vector/transparent asset if it becomes available. Do not replace it with text only, a generic icon, or an AI-drawn symbol.
- Overall feeling: warm, optimistic, credible, parent-first, inviting to students; no clutter, dark corporate dashboard or generic SaaS landing-page style.
- Style hierarchy: dark blue/teal headlines, blue-green highlights, warm cream paper background, soft mint accents, gentle rounded cards, consistent whitespace.
- Fonts, line wrapping, button proportions, soft shadows, border radii and image treatment should be matched from the real rendered reference. Inspect source CSS, not guesses.
- Navigation should retain quick access to Rushab Sir, Student Journeys, Classes 5–10, Brain Spark, Life at Vardhaman and Contact.

## Scroll sequence and visual checkpoints

| Checkpoint | What must be visibly present |
| --- | --- |
| Opening hero | Parent-focused two-part headline, academy/location badge, strong teal CTA, Rushab Sir portrait in arched frame, handwriting-style callout and nameplate |
| Parent concerns | Clear story about the child's learning, three concern cards, warm tone |
| Meet Rushab Sir | Authentic seminar image and truthfully described external event, mentor introduction, small facts |
| Beyond books. Into life. | Light-background interactive gallery: 3-column desktop (responsive on smaller screens), filter chips, photo/video cards with poster and play affordance, modal/lightbox |
| Student Journeys | Deep-blue story section, illustrated *sample* story carousel/cards with clear placeholders |
| Learning values | Three outcomes, clear cards and explanatory descriptions |
| Class journey | Interactive stage with learner descriptions and visible choices restricted to Classes 5–10 |
| Brain Spark | Visually playful quiz, three levels mapped to Classes 5–6, 7–8, 9–10, answer feedback and next action |
| Parent conversation | Welcoming personal 4-step demo; no submitted details; clear progress |
| FAQ/footer | Relevant location/course information and cohesive branding |

## Required interaction states to compare

1. Gallery: `All moments`, `Sports & play`, `Achievements`, `Community`, filtered card counts.
2. Gallery: photo view, video play, pause/close, keyboard Escape, focus handling.
3. Journey: selecting Class 5, 9, 10; next/previous transitions and selected state.
4. Brain Spark: selecting each level; correct/incorrect answer; feedback; progressing three questions.
5. Student stories: next/previous and category switches. Continue to label sample content as illustrative.
6. Parent enquiry: moving between steps without sending data or asking for contact information before an approved workflow exists.
7. Mobile: logo legible, menu accessible, no sideways overflow, CTA reachable, media modal fits screen.

## Screenshots/QA

Compare the reference and integrated website at **1440×900** desktop and **390×844** mobile. Add a 768px tablet check if practical. Screenshots should cover hero, mentor/gallery, stories, class/quiz and enquiry. Document any deviations deliberately rather than silently simplifying.

**Parity does not mean pixel-perfect at the cost of accessibility.** Accept justified improvements for tap targets, reduced-motion preferences, contrast and responsiveness; explicitly list them.

