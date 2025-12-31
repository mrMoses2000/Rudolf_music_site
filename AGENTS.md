# AGENTS.md - Codex & Developer Guide

## Continuity Ledger (compaction-safe)
Maintain a single Continuity Ledger for this workspace in `CONTINUITY.md`. The ledger is the canonical session briefing designed to survive context compaction; do not rely on earlier chat text unless it’s reflected in the ledger.

### How it works
- At the start of every assistant turn: read `CONTINUITY.md`, update it to reflect the latest goal/constraints/decisions/state, then proceed with the work.
- Update `CONTINUITY.md` again whenever any of these change: goal, constraints/assumptions, key decisions, progress state (Done/Now/Next), or important tool outcomes.
- Keep it short and stable: facts only, no transcripts. Prefer bullets. Mark uncertainty as `UNCONFIRMED` (never guess).
- If you notice missing recall or a compaction/summary event: refresh/rebuild the ledger from visible context, mark gaps `UNCONFIRMED`, ask up to 1–3 targeted questions, then continue.

### `functions.update_plan` vs the Ledger
- `functions.update_plan` is for short-term execution scaffolding while you work (a small 3–7 step plan with pending/in_progress/completed).
- `CONTINUITY.md` is for long-running continuity across compaction (the “what/why/current state”), not a step-by-step task list.
- Keep them consistent: when the plan or state changes, update the ledger at the intent/progress level (not every micro-step).

### In replies
- Begin with a brief “Ledger Snapshot” (Goal + Now/Next + Open Questions). Print the full ledger only when it materially changes or when the user asks.

### `CONTINUITY.md` format (keep headings)
- Goal (incl. success criteria):
- Constraints/Assumptions:
- Key decisions:
- State:
- Done:
- Now:
- Next:
- Open questions (UNCONFIRMED if needed):
- Working set (files/ids/commands):

> [!CAUTION]
> **URGENT FIXES REQUIRED (HANDOVER TASKS):**
> 1.  **Animation Delay:** User reports significant "lag" during page transitions even after removing `mode="wait"`. Investigate huge image sizes or blocking JS.
> 2.  **JeKits Image:** The image (`/images/uploaded_image_1_1767170720365.png` or `Jekitz-ts...`) is too small/unformatted at the bottom. **Action:** Style it to be full-width/hero-like (similar to other pages).
> 3.  **Musikkurse Images:** User reports images are missing from the grid. Check `pages.musikkurse.images` in `content.js` and ensure `Musikkurse.jsx` renders them.
> 4.  **Jobs Button:** The `/jobs` page is missing a Call-to-Action. **Action:** Add a "Jetzt Anmelden" button that links to `/contact` (with subject pre-fill).
> 5.  **Gesang -> Klavier Bug:** Clicking "Gesangunterricht" (`/offer/gesangunterricht`) loads "Klavier" content. **Cause:** `content.js` defines slug as `gesangunterricht` but the instrument key is `gesang`. **Fix:** Align them.


> [!IMPORTANT]
> **Primary Directive:** You are an autonomous agent (Codex). Your mission is to ensure the **exact** and **complete** migration of content from the legacy site (`music_site_copy/`) to the new React site (`site/`).
> **Language Rule:** Communicate with the user in **Russian** (Русский язык).
> **Autonomy:** You are authorized and EXPECTED to fix content discrepancies (missing text, wrong prices, broken images) **without asking for permission**, provided the source is the legacy website.

## 1. Project Overview & Architecture
**Name:** Musikschule CMS Bielefeld (Rudolf Music Site)
**Goal:** Modernize the school's web presence while preserving 100% of the original content and "soul".
**Tech Stack:**
- **Frontend:** React (Vite) + Tailwind CSS + Framer Motion.
- **Data Source:** `site/src/data/content.js` (Central JSON Store).
- **Structure:**
    - `site/src/pages/*.jsx`: Page templates. They fetch data from `content.js`.
    - `site/src/components/Blocks.jsx`: Renders the content blocks (`h1`, `p`, `li`, `ul`). **Updated to support `ul` with `items` array.**

## 2. Critical Workflows for Codex

### A. Content Verification (The "Source of Truth")
The legacy website files are in `music_site_copy/`. This is your Bible.
1.  **Compare:** Open a page on the new site (e.g., `/jekits`) and compare it with the legacy HTML (`JeKits.html`).
2.  **Identify Gaps:** Look for missing paragraphs, missing "Details" sections, or incorrect prices.
3.  **Fix:**
    - Open `site/src/data/content.js`.
    - Locate the corresponding key (e.g., `pages.jekits`).
    - Add/Update the `blocks` array to match the legacy content 1:1.
    - **Do not ask "Should I update?":** Just do it.

### B. Image Handling
1.  **Source:** All images are in `site/public/images/`.
2.  **Usage:** Reference them in `content.js` as `/images/filename.png` or `/images/filename.jpg`.
3.  **Missing Images?**
    - Check `music_site_copy/` to see what *should* be there.
    - Check `site/public/images/` to find a matching or suitable replacement.
    - If the user provides new images (e.g., `uploaded_image_*.png`), prioritize those.
4.  **Gallery/Grid:** Pages like `Musikkurse` and `Kunst` rely on `images` arrays in `content.js`. If a page looks empty of images, check if the `images` array is populated in `content.js`.

### C. Troubleshooting Common Issues
-   **Blank Page (White Screen):**
    -   Usually caused by `Blocks.jsx` encountering an unknown data type.
    -   *Check:* Does `content.js` have a block with `type: "ul"`? Ensure `Blocks.jsx` handles it (It was patched to handle `ul` with `items`).
-   **"Worse" Animation/Performance:**
    -   We disabled `mode="wait"` in `App.jsx` to make navigation snappier.
    -   Avoid adding heavy entrance animations to *every* text block if it harms readability.
-   **Routing Issues:**
    -   `ScrollToTop` component handles scroll reset on consumption.
    -   `App.jsx` handles the routes.

## 3. Deployment
-   **Command:** `./run.sh`
-   **Context:** This script builds the React app and restarts the Nginx Docker container. Run this only if explicitly asked or if you need to verify a "production" build behavior, but usually `dev` mode is sufficient for verification.

## 4. Specific Page nuances
-   **Jobs (`/jobs`):** Content is in `pages.jobs`. Header image is `Stellenangebote.png`. If missing, check `content.js`.
-   **JeKits (`/jekits`):** Content is in `pages.jekits`. Uses a grid for images.
-   **Musikkurse (`/musikkurse`):** Content is in `pages.musikkurse`. Uses `blocks` for text and `images` for the gallery grid.
-   **Offer (`/offer`):** Hub page. Links to instruments.

## 5. Contact & Forms
-   **Web3Forms:** Configured in `Contact.jsx`.
-   **Target Email:** `mosesvasilenko0002@gmail.com`
-   **API Key:** `e6f51cb3-ae9e-4deb-9989-5cf892fbc8a4`

---
**Message to Codex:**
Trust your eyes and the `music_site_copy` data. If the new site looks "empty" compared to the old HTML, fill it up. You have full write access to `content.js`. Make it perfect.
