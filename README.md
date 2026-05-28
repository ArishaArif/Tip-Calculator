# Tip Calculator

A live-updating tip calculator and bill splitter. No build step required.

## Run locally

```bash
# Option 1 — open directly
open index.html

# Option 2 — local server (avoids file:// quirks)
npx serve .
# → http://localhost:3000
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup |
| `style.css` | All styles |
| `script.js` | All logic — validation, calculation, DOM updates |

## Features

- Live calculation as you type — no submit button
- Preset tip buttons (10 / 15 / 20 %) + custom % input
- People stepper with +/– buttons
- Inline error messages (no `alert()`)
- Round-up rounding policy (group never underpays)
- Full reset button
- Responsive down to 360 px
- Keyboard navigable; errors announced via `aria-live`
