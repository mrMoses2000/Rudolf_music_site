# AGENTS.md - Project Context & Guidelines

> [!IMPORTANT]
> **Language Rule:** ALWAYS communicate with the user in **Russian** (Русский язык).


## 1. Project Overview
**Name:** Rudolf Music Site (Musikschule CMS Bielefeld)
**Goal:** A complete redesign and modernization of a traditional music school website. The goal is to move from an old, static HTML site to a modern, dynamic React application without losing ANY content or "soul", but significantly improving the visual appeal ("Wow-Factor") and checking responsiveness.

**Current State:**
- **Stack:** React (Vite), Tailwind CSS, Framer Motion.
- **Hosting:** Direct Docker container on an Ubuntu VPS.
- **Deploy:** `./run.sh` script (Handles build & docker restart).
- **Design:** Currently "Spotify-Dark" theme (Black/Gold/Green), but feedback indicates it may be **too dark/oppressive** for the target audience (older director, parents). We are pivoting to a friendlier, brighter, but still premium aesthetic.

## 2. Directory Structure

### `site/` (The Application)
- `src/main.jsx`: Entry point.
- `src/App.jsx`: Main Router (React Router). **Crucial:** Handles page transitions (`AnimatePresence`).
- `src/components/Layout.jsx`: The global shell. Contains the **Header** (Nav) and **Footer**.
- `src/pages/`:
    - `Home.jsx`: Landing page. Parallax hero, categories grid.
    - `InstrumentPage.jsx`: Dynamic template for *all* instruments (`/instrument/:name`). Uses `useParams` to fetch data.
    - `Contact.jsx`: Contact form. **Integrated with Web3Forms** (Key: `e6f51cb3...`).
    - `Fees.jsx`: Pricing table.
    - `About.jsx`: School history and mission.
- `src/data/content.js`: **THE BRAIN.** This file contains ALL text, image paths, and instrument data.
    - *Agent Note:* If you need to fix a typo, add a new instrument, or change a price, you edit **ONLY** this file.

### `music_site_copy/` (The Source of Truth)
- Contains the ripped HTML of the *original* website.
- **Rule:** If the user asks "Did we miss something?", check this directory. Every page here (e.g., `JeKits.html`, `Kunst.html`) MUST have an equivalent representation in the new `site/`.

## 3. Design Philosophy (Updated)
- **Primary:** "Premium, Friendly, Trustworthy."
- **Old Direction:** "Spotify Dark" (Too dark).
- **New Direction:** "Warm & Bright Premium."
    - Less #000000 (Pure Black).
    - More Warm Whites, Creams, or very soft/warm darks if used.
    - **Typography:** Big, bold, legible (`Outfit` for headers, `Inter` for body).
    - **Motion:** Staggered reveals, smooth scrolling, parallax. "It should feel alive."

## 4. Operational "Agents" Workflow (Future)
We are building towards a **Headless AI CMS**.
1.  **User** sends a request via Telegram ("Update price of Piano").
2.  **n8n** triggers an **AI Agent**.
3.  **AI Agent** creates a command for the **Gemini CLI** on the server.
4.  **Gemini CLI** (running via SSH) edits `src/data/content.js` directly.
5.  **Rebuild:** The system runs `./run.sh` to redeploy.

## 5. Critical Constraints
- **Responsiveness:** MUST look good on mobile. (Watch out for long German words like *Streichinstrumente*).
- **Images:** Stored in `/images` (public folder). Real content images are vital.
- **Email:** `Contact.jsx` must point to `mosesvasilenko0002@gmail.com` via Web3Forms.

## 6. How to Edit
1.  **Code Changes:** Edit file in `site/src/...`.
2.  **Content Changes:** Edit `site/src/data/content.js`.
3.  **Deploy:** Run `./run.sh` in the root.
