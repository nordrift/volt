# DESIGN.md — Volt

Volt's product-surface design file. It **inherits from** `../../brand/DESIGN.md`
(the Nordrift system) and overrides nothing in it without a written reason.

The parent file is a marketing-and-web spec and says so in its own Known Gaps:
numeric inputs, live-updating result rows, stack navigation and one-handed touch
targets are not covered there. This file covers exactly those, and nothing else.

Every value here is real and belongs in `src/theme.ts`. Nothing in this file is
an adjective.

---

## Register

Volt runs on two themes, on the same token names: **light**, the default, and
**dark**, the original product-surface register this file was built around. A
toggle in the Home header switches between them; every other screen looks and
behaves identically in both, because it reads the same names and only the
values change.

Indigo is the line between the two. The parent system documents that
`accent-indigo` hits 1.98:1 against black and is unreadable there — that's
why dark theme runs on `accent-frost` and `accent-fjord` instead, never
indigo. On white, indigo has full contrast, so light theme uses it as the
brand accent: it anchors Ohm's law and the other tools' icon-chip glyphs.
Each theme keeps to its own accent; the two never mix on one screen.

## What that rules out

- No shadows and no gradient depth. The parent's elevation model is surface
  contrast plus a hairline, and it holds here.
- No decorative colour, with one named exception: the Home row's icon chip,
  one muted hue per tool. Everywhere else accent marks state — focus,
  selection, a calculated value — and nothing else.
- Indigo stays on the light surface only. See above.
- No second chromatic voice. Warning uses `surface-sand` (dark) or its light
  equivalent, already in the palette.
- No entrance animation. Motion answers input, or doesn't happen.
- No editorial serif. Tiempos is a marketing face; the product surface is
  grotesque and mono only.

---

## Colour

### Dark theme

Inherited tokens, unchanged, with their parent names:

| Token | Hex | Use in Volt |
|---|---|---|
| `inverse` | `#000000` | Screen background |
| `canvas` | `#faf9f5` | Primary text, and the readout value |
| `text-secondary` | `#b0aea5` | Labels, units, zone headings |
| `text-tertiary` | `#87867f` | Placeholder, disabled, captions |
| `accent-frost` | `#cbcadb` | Calculated values, the dark-surface accent |
| `accent-fjord` | `#7289c0` | Focus ring, active segment |
| `surface-sand` | `#ebdbbc` | Warning — a value outside safe limits |
| `surface-tan` | `#d4a27f` | The resistor body in the colour-code illustration |

Product-surface additions. The parent defines no dark ladder above `#000000`,
so Volt defines three steps and documents them here:

| Token | Hex | Use |
|---|---|---|
| `well` | `#12161C` | Input wells, keypad keys, anything touchable |
| `well-pressed` | `#1A1F27` | Pressed state on a well or key |
| `hairline-dark` | `#1E2530` | Row separators, zone divisions, well borders |

These three exist only because black has no lighter steps in the parent palette.
If the parent ever tokenises a dark ladder, these are replaced by it.

**Resistor bands are the exception to everything above.** They are standardised
data, not styling, and render at their true colours. See the component rule.

### Light theme

The parent system has no light palette to inherit, so these are Volt's own —
the same reasoning as `well`/`well-pressed`/`hairline-dark` above, applied to
a second theme instead of a second dark step:

| Token | Hex | Use in Volt |
|---|---|---|
| `canvas-light` | `#ffffff` | Screen background |
| `text-primary-light` | `#141413` | Primary text — screen title, row title, and (by weight, not colour) the Home header's "About" link |
| `text-secondary-light` | `#5e5d59` | Subtitles, labels, units, zone headings |
| `text-tertiary-light` | `#b0aea5` | Chevrons, placeholder, disabled |
| `accent-indigo` | `#3c3a63` | Brand accent — Ohm's law, calculated values, focus |
| `surface-sand-light` | `#9c6b2c` | Warning — a value outside safe limits (designed, not sampled: no warning state appears in the Home mockup; needs enough contrast on white that dark theme's `surface-sand` doesn't have) |
| `well-light` | `#f4f2ed` | Input wells, keypad keys on light theme (designed, not sampled: no well appears in the Home mockup) |
| `well-pressed-light` | `#ece9e1` | Pressed state on a well or key (designed, not sampled) |
| `hairline-light` | `#e8e6de` | Row separators, zone divisions |

Every value above except the three marked "designed, not sampled" was read
directly off `design/Volt Home-selection-light.png` with a colour picker —
not eyeballed. The three unsampled ones cover UI that doesn't appear on the
Home screen (input wells, warning state) and should be re-checked once a
mockup for a tool screen exists.

### Per-tool icon chip

One muted hue per tool, sampled the same way from both mockups:

| Tool | Chip bg (light) | Glyph (light) | Chip bg (dark) | Glyph (dark) |
|---|---|---|---|---|
| Resistor colour code | `#f4e7d0` | `#8a6534` | `#2a2116` | `surface-tan` (`#d4a27f`) |
| Ohm's law | `#e4e3ed` | `accent-indigo` (`#3c3a63`) | `#21203a` | `accent-frost` (`#cbcadb`) |
| Voltage divider | `#e1e6f2` | `#47598a` | `#182034` | `#8fa3d4` |
| LED resistor | `#efe0ea` | `#854c70` | `#2b1d27` | `#c98fb2` |
| E-series lookup | `#dfe9e3` | `#3f6450` | `#16241c` | `#8ab29c` |

This is the one named exception under "colour never decorates" — see What
that rules out.

## Type

Two families. Inter carries everything readable — it is the parent's documented
fallback for Söhne, and bundling Söhne would require a paid Klim licence.
JetBrains Mono carries every number, and needs no licence.

Mono on numbers is functional, not stylistic: values update on every keystroke,
and proportional digits make a number jitter as its glyph widths change. Tabular
figures hold still.

| Role | Family | Size | Weight | Line height |
|---|---|---|---|---|
| `readout` | JetBrains Mono | 44 | 500 | 52 |
| `readoutUnit` | JetBrains Mono | 18 | 400 | 26 |
| `value` | JetBrains Mono | 20 | 400 | 26 |
| `key` | JetBrains Mono | 22 | 400 | 28 |
| `screenTitle` | Inter | 26 | 600 | 32 |
| `toolName` | Inter | 19 | 600 | 24 |
| `body` | Inter | 16 | 400 | 22 |
| `label` | Inter | 14 | 400 | 18 |
| `caption` | Inter | 12 | 400 | 16 |

Weights to bundle: Inter 400 and 600, JetBrains Mono 400 and 500. Four files,
nothing else. Sentence case throughout.

The parent's `eyebrow` role — JetBrains Mono, uppercase — appears in exactly one
place in Volt: `BY NORDRIFT` beneath the wordmark on the About screen, per the
parent's sub-brand lockup rule. Nowhere else.

## Spacing

Inherited: `4 · 8 · 12 · 16 · 24 · 32 · 48`. The parent's `3xl` (96) is a
desktop section rhythm and is unused here.

Screen horizontal padding is 20. Vertical rhythm between grouped elements is 16,
between zones 24.

## Radius

Inherited, applied narrowly:

| Token | Value | Applies to |
|---|---|---|
| `sm` | 8 | Input wells, keypad keys, segmented controls |
| `sm` | 8 | Band swatches |
| — | 0 | Every zone, every row, every full-bleed panel |

The parent's `md` (16) and `lg` (24) are card and container radii and have no
use on this surface.

## Touch

Minimum interactive height **56**. Android guidance is 48; Volt is used
one-handed while holding a component, so it gets more. Keypad keys run taller.

## Motion

120ms, ease-out, on exactly two things: focus moving between fields, and a
displayed value changing. Nothing animates on mount. Nothing animates on scroll.

## Theme persistence

The chosen theme is the one piece of state Volt writes to disk. On first
launch, before any explicit choice exists, the app follows the OS colour
scheme. Once the user taps the toggle, that choice is saved and wins over the
system scheme on every subsequent launch, until changed again. Nothing else
persists — see `PRODUCT.md`'s Data model.

---

## Screen anatomy

Every tool screen is three stacked zones, top to bottom:

1. **Header** — back arrow, screen title, reset control.
2. **Calculated** — the answers. Flat, `inverse` background, untouchable.
3. **Entered** — the wells you type into, low on the screen in thumb reach.
4. **Keypad** — fixed to the bottom, always visible.

Zones are separated by a 1px `hairline-dark` rule and nothing else. No cards, no
radius, no elevation between them.

**The distinction between entered and calculated is carried by position, not by
colour.** Nothing you typed ever appears in the Calculated zone, so a glance at
the top of the screen needs no reading. Colour reinforces it — calculated values
render in `accent-frost` — but the layout alone would survive greyscale.

---

## Components

### Header
56 tall. Back arrow left, title in `screenTitle`/`canvas`, reset control right.
Reset clears every field and returns the screen to its empty state. Back
affordance is the arrow plus the system gesture; no custom chrome.

### Home header
56 tall, same height as Header, different contents — Home is the root, so
there's no back arrow and nothing to reset. "Volt" left, in `screenTitle`/
`text-primary`. Right side carries the light/dark toggle and "About" — the
mockup renders "About" in the same ink as the title (`text-primary`), not a
dimmer secondary colour; it reads as lighter only because it's set in `body`
weight 400 at a smaller size, not because the colour changes. Tapping the
toggle switches theme immediately (120ms ease-out on the colours that change)
and persists the choice — see Theme persistence.

### Calculated zone
`inverse` background, 20 horizontal padding, 24 vertical. Heading "Calculated"
in `label`/`text-secondary`. Values beneath in `accent-frost`.

Not touchable except for one action: tapping a calculated value takes that field
over as an input, and the older of your two existing entries is released back to
calculated. That is the only interaction in this zone.

Empty state replaces the values with a single line — "Enter any two values" in
`label`/`text-secondary`, and an em dash in `text-tertiary` where the number
would be. Never a zero: zero is a real answer and must not be faked.

### Readout
The screen's one loud element. `readout` size in `canvas`, unit following in
`readoutUnit`/`text-secondary`. One per screen.

**Ohm's law is the documented exception.** It derives two values at once, unlike
every other tool, and promoting either one to readout size would be an arbitrary
choice the user can't account for. On that screen both calculated values render
at `value` size in `accent-frost`, equal weight, no hero. Every other tool keeps
a single readout.

### Input well
Label above in `label`/`text-secondary`. The well is `well` filled, 56 tall,
radius `sm`, 1px `hairline-dark` border. Value in `value`/`canvas`, left
aligned. Unit in `label`/`text-secondary`, pinned right.

On focus the border becomes `accent-fjord` and the label brightens to `canvas`.
Empty shows an em dash in `text-tertiary`.

### Keypad
Fixed to the bottom of every tool screen, always visible, never animated in or
out. Twelve keys in a 3×4 grid: digits, decimal point, backspace. Each key is
`well` filled, radius `sm`, separated by 8, minimum 64 tall, glyph in
`key`/`canvas`. Pressed state fills `well-pressed`.

This replaces the system numeric keyboard deliberately. The layout never shifts,
every target is sized for a thumb, and Android OEM keyboard variation stops
being a problem. It is the one bespoke input control in the app.

### Warning line
Sits directly under the affected result. 1px `surface-sand` rule on the left,
text in `surface-sand` at `label` size. States what is wrong and what to do —
*"Exceeds 1/4 W — use a 1/2 W resistor."* No icon, no apology.

### Segmented control
Band count, series selector, forward/reverse mode. `well` track, radius `sm`,
selected segment fills `well-pressed` with a 1px `accent-fjord` top edge, label
in `canvas`. 56 tall.

### Home row
Full-bleed, content-sized — not stretched to fill the screen. Empty space
below the fifth row is deliberate headroom for future tools, not a bug to
"fix" by re-stretching rows. 20 horizontal padding, separated by 1px hairline
(`hairline-light` / `hairline-dark`). Left to right: a 38×38 icon chip
(radius `sm`, custom SVG glyph, one muted hue per tool — see Colour), tool
name in `toolName`/`text-primary`, one line beneath in `label`/
`text-secondary` saying what it does in plain words, chevron right in
`text-tertiary`. Pressed state fills `well-pressed`.

### Resistor illustration
The one place colour is not a state signal.

Draw the component: a `surface-tan` body with short leads in `text-tertiary`
either side. Bands sit on the body at their true standardised colours, so black
and brown stay legible — they are on tan, not on black. Beneath each band, its
digit or multiplier in `caption`/`text-secondary`. The band being edited gets an
`accent-fjord` underline.

---

## Settled on the canvas

- Ohm's law uses zone separation, not colour-coding in a fixed list. Nothing
  entered appears in the Calculated zone.
- Both of Ohm's law's calculated values carry equal weight. No artificial
  primary answer.
- The keypad is in-app and permanent, not the system keyboard.
- The header carries a reset control.
- Entered wells sit low, in thumb reach, below the calculated zone.
- Home's list is top-aligned under the header, content-sized rows, not
  bottom-weighted — confirmed by the approved mockup.

## Still open

1. Reverse mode on the resistor screen — segmented control, or whole-screen
   inversion?
2. E-series results — three values as a row, or a stack?
3. Does the Entered zone use a two-column grid on screens with four fields, as
   the Ohm's law mockup does, or stay single-column everywhere for consistency?
