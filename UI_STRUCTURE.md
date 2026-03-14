# UI_STRUCTURE.md – BloomCycle

This document defines the UI structure, page map, color theme, and **visual design rules** for BloomCycle.  
An AI agent should follow these instructions when generating or modifying UI code.

---

## 1. Design Language & Color Theme

BloomCycle should feel **calm**, **modern**, and **premium**, similar to top health apps (Flo, Clue, Ovia) but with its own character.[file:1]

### 1.1 Core Palette (Design Tokens)

Use these tokens in Tailwind config or CSS variables. Avoid inventing random colors.

- **Primary (Bloom lavender) – main brand**
  - `primary-50`:  `#F7F4FF`
  - `primary-100`: `#E7DFFF`
  - `primary-200`: `#D3C2FF`
  - `primary-300`: `#B59AFF`
  - `primary-400`: `#9872FF`
  - `primary-500`: `#7B4CF2`  ← main CTA, highlights
  - `primary-600`: `#6439CC`
  - `primary-700`: `#4D2BA3`
  - `primary-800`: `#381F7A`
  - `primary-900`: `#241550`

- **Accent (Bloom coral) – emotional highlights**
  - `accent-50`:  `#FFF4F4`
  - `accent-100`: `#FFE0DD`
  - `accent-200`: `#FFC1BA`
  - `accent-300`: `#FF9C8F`
  - `accent-400`: `#FF7A6B`
  - `accent-500`: `#FF5A4A`
  - `accent-600`: `#E0473A`
  - `accent-700`: `#B5362C`
  - `accent-800`: `#89251F`
  - `accent-900`: `#5C1713`

- **Support (Calm teal) – success/healthy states**
  - `support-50`:  `#ECF9F7`
  - `support-100`: `#D0EFEB`
  - `support-200`: `#A5E0D7`
  - `support-300`: `#73CCBF`
  - `support-400`: `#4FB5A7`
  - `support-500`: `#339A8C`
  - `support-600`: `#277A6F`
  - `support-700`: `#1C5B53`
  - `support-800`: `#123E38`
  - `support-900`: `#092322`

- **Neutrals**
  - `neutral-50`:  `#FBFBFC`
  - `neutral-100`: `#F4F5F7`
  - `neutral-200`: `#E5E7EB`
  - `neutral-300`: `#D1D5DB`
  - `neutral-400`: `#9CA3AF`
  - `neutral-500`: `#6B7280`
  - `neutral-600`: `#4B5563`
  - `neutral-700`: `#374151`
  - `neutral-800`: `#1F2933`
  - `neutral-900`: `#111827`

- **Semantic**
  - Success: `#1F9D55`
  - Warning: `#E19D2B`
  - Error:   `#DC2626` (use sparingly)

### 1.2 Visual Style Rules

**Agent must:**

- Use **rounded corners** (`border-radius: 16px` for cards, `9999px` for pills/chips).  
- Use **soft shadows** (`shadow-md` / `shadow-lg`) and **layered surfaces**:
  - Background: `neutral-50` or white.
  - Cards: white with subtle shadow and 1px border `neutral-200`.
- Use **vertical spacing** (`space-y-4` / `space-y-6`) and avoid cramped layouts.
- Use **large, clean typography**:
  - Page title: 24–32px, `font-semibold`, `neutral-900`.
  - Section titles: 18–20px, `font-semibold`.
  - Body text: 14–16px, `neutral-700`.
  - Use one main sans-serif font (e.g., Inter, SF Pro, or system font stack).
- Use **iconography**:
  - Include icons for nav items and action buttons (e.g., from Heroicons or Lucide).
  - Do not render plain text-only buttons for primary actions.
- Use **status chips** with color:
  - Example: pill showing “Fertile window”, “Period day”, “Pregnancy week X” with `primary-50` / `accent-50` backgrounds.

### 1.3 Color Usage Rules

**Agent must follow these patterns:**

- Primary CTAs (`Save`, `Log today`, `Continue`):
  - Background: `primary-500`
  - Text: `#FFFFFF`
  - Hover: `primary-600`
  - Disabled: `primary-200` + `cursor-not-allowed`
- Secondary buttons:
  - Border: `primary-200`
  - Background: `primary-50`
  - Text: `primary-600`
- Destructive actions:
  - Background: `error` color with low intensity, or text-only with underline.
- Info cards:
  - Background: `primary-50` or `support-50`
  - Title: `neutral-800`
  - Subtext: `neutral-600`
  - Accent border on left: `primary-300` (3–4px).
- Warnings:
  - Background: `accent-50`
  - Icon: `warning` color, but text remains `neutral-800`.

### 1.4 Responsive Rules

**Agent must always:**

- Use a **mobile-first** grid:
  - Single column on small screens; 2–3 columns on desktop (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- Ensure important actions are reachable with **thumb** on mobile:
  - Place key CTAs at bottom area where relevant (e.g., “Log today”).
- Use **flex + wrap** or **grid** for card layouts; avoid fixed pixels for widths.
- Limit max width for content (`max-w-5xl` or `max-w-6xl`) and center container (`mx-auto px-4 sm:px-6`).
- Make charts responsive with `width: 100%` and a fixed height (e.g., 260–320px).

### 1.5 Text Spacing & Vertical Rhythm Rules

Agent must enforce these layout details in all pages:

- **Label/value rows must never collapse text together.**
  - Use explicit separators (`:`) and a two-column row layout.
  - Example visual rule: `Email: user@example.com` (not `Emailuser@example.com`).
  - Keep minimum horizontal gap between label and value: `12px`.
- **Long values must wrap safely** using `overflow-wrap: anywhere` (especially email and IDs).
- **Top/bottom page spacing must be consistent**:
  - Mobile: `padding-top 20px`, `padding-bottom 28px`.
  - Desktop: `padding-top 28px`, `padding-bottom 36px`.
- **Card inner spacing**:
  - Default card padding: `24px`.
  - Compact cards (dense lists): `16px`.
- **Section spacing**:
  - Between major sections: `20px` to `24px`.
  - Between title and body text: `8px` to `12px`.

### 1.6 Loading States (Mandatory)

Agent must provide visible loading feedback on all async page transitions:

- Use a reusable full-screen loader component:
  - `components/ui/full-screen-loader.tsx`
- Wire global App Router loading fallback:
  - `app/loading.tsx`
- Visual rules:
  - Full viewport overlay with soft background blur.
  - Spinner in `primary-500` with neutral background ring.
  - Short loading text (`"Loading BloomCycle..."`).
- Use additional local skeletons/loaders inside heavy cards if needed, but keep the full-screen fallback as baseline.
- Auth actions must show submit-state loaders:
  - Login button shows pending label (e.g., `Logging in...`) and disables itself.
  - Logout button shows pending label (e.g., `Logging out...`) and disables itself.
  - For login/logout submit actions, show full-screen loader overlay while action is in-flight.

---

## 2. Global Layout & Navigation

### 2.1 Layout

- Root layout has:
  - Top navigation bar with logo, section tabs, and user avatar menu.
  - Left sidebar (desktop) for quick nav; collapsible drawer on mobile.
  - Main content container with max-width and consistent padding.
- Top nav background: white with subtle shadow and border bottom `neutral-200`.
- Active nav item:
  - Text: `primary-600`
  - Underline or pill highlight using `primary-50` background.

### 2.2 Navigation Sections

Auth group:
- `/login`, `/signup`, `/reset-password`, `/update-password`
- Callback handlers: `/auth/callback`, `/auth/confirm`

App group:
- `/dashboard`
- `/cycle`
- `/fertility`
- `/pregnancy`
- `/baby`
- `/learn`
- `/community`
- `/settings/*`

---

## 3. Dashboard – Visual Rules

- Use a **hero card** at top:
  - Soft gradient background (e.g., `from-primary-50 to-support-50`).
  - Large title (“Hi, [Name]”) and stage chip (“Cycle tracking”, “Week 18 pregnancy”).
- Below hero, use a responsive grid of **interactive cards** (clickable, hover scale/opacity change).
- Each card must include:
  - Icon in colored circle.
  - Title.
  - Key number or status (e.g., “Day 14 of cycle”).
  - Short hint text.
- On mobile: stack cards with `space-y-3`; on desktop: `grid-cols-2` or `grid-cols-3`.

---

## 4. Cycle & Symptom Screens – Visual Rules

- Calendar:
  - Use a modern period-tracker look: rounded day pills, subtle dots/badges.
  - Period days: filled with `accent-100` background and border `accent-300`.
  - Predicted fertile days: outlined with `support-300`, small pill label “F” or “Fertile”.
  - Today: outer ring with `primary-400`.
- Day details panel:
  - Slide-out drawer (on mobile) or side card (desktop).
  - Show status chips: `Period`, `Fertile`, `Luteal phase` (just labels now).
- Symptoms:
  - Use sliders or emoji-like icons for mood and pain intensity.
  - Use segmented buttons for quick selections (e.g., “Low / Medium / High energy”).

---

## 5. Fertility Screen – Visual Rules

- Fertility timeline:
  - Horizontal stepper with days of cycle, colored segments for period, fertile window, ovulation.
  - Smooth gradient from `support-200` to `support-500` over fertile days.
- BBT chart:
  - Line chart with `primary-400` line, dots on recorded points.
  - Highlight ovulation prediction day with a vertical line or marker.

---

## 6. Pregnancy Screens – Visual Rules

- Week card:
  - Large pill with “Week X” and a friendly illustration or icon (can be placeholder).
  - Progress bar from 0 to 40 weeks using `primary-300` background and `primary-500` fill.
- Kick counter / contraction timer:
  - Use **big circular button** for Start/Stop with `primary-500`.
  - Show timer digits in large font (digital style).
  - History list with cards showing date, duration, and notes.

---

## 7. Baby & Postpartum Screens – Visual Rules

- Baby cards:
  - Use soft pastel backgrounds (`accent-50`, `primary-50`).
  - Include avatar or initials circle; show age in a chip.
- Milestones:
  - Use timeline with dots and connecting line.
  - Each milestone is a card; milestone date as subtle small text; milestone title bold.

---

## 8. Learn / Content Screens – Visual Rules

- Article list:
  - Card layout with image or colored header strip.
  - Topic chip (e.g., “Pregnancy”, “Cycle health”) with `primary-50`.
  - Reading time indicator with icon.
- Article detail:
  - Comfortable reading width (`max-w-3xl`).
  - Larger font size and generous line-height.
  - Use heading styles and bullet lists for readability.

---

## 9. Community Screens – Visual Rules

- Post cards:
  - Show category chip, title, preview of first 1–2 lines.
  - Show meta: author (or “Anonymous”), time since posted, comment count.
- Comments:
  - Use nested style but keep at 1 level depth to avoid clutter.
  - Highlight original poster with a subtle badge.

---

## 10. Settings Screens – Visual Rules

- Use **two-column layout** on desktop:
  - Left: vertical nav for Settings sections.
  - Right: content card with forms.
- Forms:
  - Use grouped sections with headings.
  - Use full-width inputs; avoid cramped horizontal forms.

---

## 11. Shared Components – Styling Rules

- Buttons:
  - Sizes: `sm`, `md`, `lg`; use consistent paddings.
  - Always use border-radius `9999px` for primary buttons (pill style).
- Inputs:
  - Rounded corners, border `neutral-300`, focus ring `primary-300`.
  - Label above input; helper text below in `neutral-500`.
- Modals:
  - Centered, `max-w-lg`, rounded, shadow-lg, overlay `bg-black/40`.

---

## 12. Rules for the Agent

When generating UI code:

1. **Always apply the color tokens** defined above. Do not invent random hex colors.  
2. **Use cards, gradients, and icons** to avoid flat, boring layouts.  
3. **Ensure responsiveness**:
   - Use Tailwind `sm`, `md`, `lg` breakpoints to adapt grids and layouts.
4. **Prioritize readability**:
   - No tiny fonts; no crowded sections; use spacing classes (e.g., `py-4`, `space-y-4`).
5. **Keep tone gentle**:
   - Avoid harsh reds or aggressive warnings, especially around health content.

This file is the visual and interaction contract for BloomCycle’s UI.
