# AGENTS.md - Codex & Developer Guide

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
