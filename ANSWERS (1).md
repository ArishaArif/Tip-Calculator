# ANSWERS.md

## 1. How to run

No build step needed — it's vanilla HTML/CSS/JS.

```bash
# Clone the repo
git clone <your-repo-url>
cd tip-calculator

# Open in browser (any of these work)
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Or serve with a local server to avoid any browser file:// quirks:

```bash
npx serve .
# → http://localhost:3000
```

**Deployed URL:** *(add your Vercel/Netlify link here)*

---

## 2. Stack & design choices

**Stack:** Vanilla HTML + CSS + JavaScript — no framework, no build tool. For a single-screen calculator with no routing, no shared state between components, and a 25-minute constraint, a framework would add ceremony without benefit. The entire logic fits in ~120 lines of JS; the DOM is small enough to address directly.

**Decision 1 — Preset tip buttons take the full row width as a 3-column grid.**
I used `grid-template-columns: repeat(3, 1fr)` so the three presets fill the container equally. This makes tap targets large on mobile (the most likely use context — you're at a restaurant), and visually groups them as a single control. A flex row would have left awkward gaps at narrow widths.

**Decision 2 — Per-person share is displayed *alongside* (not instead of) the running totals.**
The results panel shows four values: tip total, grand total, per-person share, and tip-per-person. I kept all four visible at once rather than hiding some behind a "split" toggle because the cognitive load at a restaurant table is high — you want all the numbers in one glance, not a two-step interaction. The grand total uses a larger font and accent color (`highlight` class) to draw the eye first, with the per-person line below it.

---

## 3. Responsive & accessibility

**360 px phone:** The container uses `width: 100%; max-width: 450px` with `padding: 20px` on the body, so it fills the narrow viewport without overflow. The tip grid stays 3 columns but reduces gap to 0.5 rem. Font sizes step down via a media query (`@media max-width: 400px`). The people counter uses `+`/`-` buttons rather than a text input so fat-finger mis-taps are impossible.

**1440 px laptop:** The card is capped at 450 px and centered — it doesn't stretch grotesquely wide. The layout is intentionally single-column; a two-column split (inputs left, results right) was considered but skipped because the vertical flow maps naturally to the mental model (enter → see result immediately below).

**Accessibility handled — inline validation with `aria-live`:**
Error messages are injected into `<span aria-live="polite">` elements adjacent to the offending input. Screen readers announce the error as it appears without interrupting the user mid-type. Inputs also get `aria-invalid="true"` set programmatically when invalid and cleared when corrected. This is the highest-impact a11y feature for a form.

**Accessibility knowingly skipped — focus-visible ring polish:**
The default browser focus ring is visible but unstyled (it shows the browser default blue outline on some inputs). Given the dark background it's usable but not pretty. With more time I'd add a custom `:focus-visible` outline using the `#64ffda` accent color to make keyboard navigation feel native to the design rather than a browser default. Skipped because it's purely cosmetic and the underlying keyboard tab order is already correct.

---

## 4. AI usage

I asked the AI what videos I should follow to build a tip calculator. It gave me a YouTube URL, and I followed that video to build the initial structure. Once I had my `index.html`, `style.css`, and `script.js` ready, I gave all three files to the AI and asked it to optimize them. That's the extent of AI involvement in this project.

---

## 5. Honest gap

**The custom tip input has no debounce — it re-calculates on every keystroke.**
This is fine at the values involved (simple arithmetic), but it means that if someone types `2` intending `25`, the result briefly flashes the `2%` calculation. A 150 ms debounce would let the user finish typing before the display updates, eliminating the flicker. With another day I'd wrap the `calculate()` call inside a `debounce` utility and also add a smooth CSS transition on the result values so changes animate rather than jump — the `pop` animation fires on change but doesn't interpolate the number itself.

---

## Rounding policy

**Round up to the nearest cent** (`Math.ceil(value * 100) / 100`).

*Why:* When dividing $33.33 among 3 people, the true share is $11.11̄ (repeating). Rounding down (floor) means the group collects $33.33 — exactly right — but only by coincidence; for other amounts it leaves a shortfall. Rounding to nearest can also fall short. Rounding up guarantees the collected total is always ≥ the actual bill + tip. The worst-case overpayment is `(people - 1) × $0.01`, which for a table of 8 is 7 cents — an acceptable and socially normal rounding surplus that nobody will dispute.
