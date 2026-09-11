# Volt — Product Specification

**Status:** v1 specification, in build
**Owner:** Nordrift
**Package ID:** `dev.nordrift.volt` (permanent once published)
**Platform:** Android first, via React Native + Expo (SDK 57)

---

## What Volt is

An offline calculator and reference for electronics bench work.

Opens instantly. Works with no internet. Asks for nothing.

## Who it's for

Electronics and electrical engineering students, hobbyists, and technicians working at a bench — someone with a breadboard in front of them who needs a number now.

## Why it exists

The Play Store has dozens of resistor calculators. Nearly all are ad-heavy, slow to load, cluttered with tools nobody uses, and require a network connection they don't need. Volt does fewer things, faster, with nothing in the way.

## Success criteria for v1

- Approved on Google Play
- Cold start under 2 seconds
- Every calculation correct, verified against known values
- Usable one-handed at a bench
- Zero permissions requested
- Looks like an instrument, not a utility app

---

## The five tools

### 1. Resistor colour code

Bidirectional. Bands to value, and value to bands.

- Supports 4-band, 5-band, and 6-band
- Output: resistance, tolerance, temperature coefficient (6-band only)
- Reverse mode: enter a resistance, get the band colours

Band meanings:
| Bands | Layout |
|---|---|
| 4-band | digit, digit, multiplier, tolerance |
| 5-band | digit, digit, digit, multiplier, tolerance |
| 6-band | digit, digit, digit, multiplier, tolerance, temp coefficient |

### 2. Ohm's law

Enter any two of voltage, current, resistance, power. Get the other two.

```
V = I × R
P = V × I
P = I² × R
P = V² / R
```

Entered and derived values are separated by **position**, not colour: derived
values live in a Calculated zone at the top of the screen, entered values in
wells at the bottom. Nothing the user typed ever appears in the Calculated zone.

This is the one tool that produces two answers simultaneously. Both render at
equal weight — there is no primary answer, because choosing one would be
arbitrary from the user's side. Every other tool has a single readout.

Tapping a calculated value takes that field over as an input; the older of the
two existing entries is released back to calculated.

### 3. Voltage divider

Forward: R1, R2, Vin → Vout
```
Vout = Vin × R2 / (R1 + R2)
```

Reverse: Vin, target Vout → suggested R1/R2 pairs from standard values.

### 4. LED series resistor

Supply voltage, LED forward voltage, desired forward current → required resistor and its power dissipation.

```
R = (Vsupply − Vf) / If
P = (Vsupply − Vf) × If
```

Output should also state the next standard resistor value up, and flag if the power rating exceeds 1/4 W.

### 5. E-series lookup

Any resistance value → nearest standard part in E12, E24, or E96.

Shows the nearest value below, nearest above, and percentage error from the input.

---

## Why these five

They chain. Calculate a divider, get 3.47 kΩ, immediately need the nearest E24 part. Size an LED resistor, need to check its power rating. Most apps make you leave the screen and retype numbers. Volt shouldn't.

---

## Explicitly out of scope for v1

Not "later maybe" — deliberately excluded so v1 ships:

- SMD resistor and capacitor codes
- Capacitor colour codes
- Series/parallel combination calculators
- RC filter cutoff, time constants
- 555 timer calculator
- PCB trace width
- Op-amp gain
- Pinout references
- Unit conversion
- Saved history or favourites
- Settings screen — the light/dark toggle lives in the Home header, not a
  dedicated settings screen
- Accounts, sync, cloud
- Ads, analytics, crash reporting

---

## Screens

| Screen | Purpose |
|---|---|
| Home | The five tools, tap to open. Header carries the light/dark toggle and About link |
| Resistor Colour Code | Band pickers + result, with reverse mode toggle |
| Ohm's Law | Four fields, fill any two, two calculated |
| Voltage Divider | Three fields + reverse mode |
| LED Resistor | Three fields, result with warnings |
| E-Series Lookup | One field, series selector, results |
| About | Version, Nordrift lockup, link to nordrift.dev, privacy policy link |

Navigation: stack. Home is the root; each tool pushes onto it. No tabs, no drawer.

Every tool screen shares one anatomy: header, Calculated zone, Entered zone,
fixed keypad. See `DESIGN.md`.

---

## Input

Volt ships its own numeric keypad, fixed to the bottom of every tool screen and
always visible. It replaces the system keyboard deliberately:

- The layout never shifts, because nothing slides in or out
- Every key is sized for a thumb by construction
- Android OEM numeric-keyboard variation stops being a problem

This is the only bespoke input control in the app.

---

## Data model

**Effectively none — one carve-out.**

- The only value written to disk is the user's chosen theme (light or dark),
  stored locally via AsyncStorage so it survives a relaunch
- Nothing else is stored on device between sessions
- Nothing is transmitted anywhere
- No user accounts
- No identifiers collected
- No analytics, no crash reporting SDK in v1

All other state is per-screen and ephemeral. Close the app, every calculation
forgets — only the theme choice remains.

This is still a product decision, not a limitation. Theme preference carries
no personal data and stays entirely on-device, so the privacy policy stays
trivially honest and the Data Safety form stays a straight set of "no"
answers.

---

## Permissions

**None.** No camera, no storage, no location, no network access declared.

---

## Technical decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo SDK 57 | Fastest path to a working Android build |
| Language | TypeScript, strict | Catches errors before runtime; better portfolio signal |
| Routing | Expo Router | File-based, current default, less boilerplate |
| State | React `useState`, plus a small module-level store for theme | Theme must be readable from every screen; still no Redux, no Zustand, no Context |
| Storage | AsyncStorage | Theme preference only — the one persisted value |
| Styling | `StyleSheet` + `src/theme.ts` | No UI library. Keeps bundle small and design consistent |
| Type | `expo-font` + Inter 400/600, JetBrains Mono 400/500 | Inter is the Nordrift system's documented fallback for Söhne, which needs a paid Klim licence. Mono numerals hold their width as values update live |
| Keypad | Hand-built, no dependency | Twelve keys and a press state. Nothing to install |
| Testing | Jest on calculation functions only | Logic is testable and worth testing. Screens are not, at this stage |

**Architecture rule:** every calculation lives in a pure function in `src/lib`, separate from any component. Screens call them. This makes the logic testable and makes the code legible to an interviewer.

---

## Design

Volt inherits the Nordrift system at `../../brand/DESIGN.md` and adds only what
that file's own Known Gaps say it doesn't cover: numeric inputs, live-updating
results, stack navigation, one-handed touch targets. Those live in Volt's
`DESIGN.md`.

The short version:

- **Two themes, light default.** A toggle in the Home header switches between
  them; the choice persists locally. Every screen reads the same token names,
  only the values change.
- **Indigo is light-only.** The parent documents indigo as unreadable on
  black at 1.98:1, so dark theme keeps frost and fjord as its accent; light
  theme uses indigo (`#3c3a63`) as its brand accent instead, where it has
  full contrast on white.
- **Position carries meaning, colour reinforces it.** Calculated values sit in
  their own zone. The layout would survive greyscale.
- **No shadows, no gradient depth.** The parent's elevation model is surface
  contrast plus a hairline, and it holds here.
- **Resistor bands are the exception.** Standardised data, not styling. They
  render at true colour on a tan component body so black and brown stay legible.
- **One muted hue per tool.** A custom SVG icon in a coloured chip on each
  Home row — the one place colour decorates rather than signalling state.
- **Grotesque and mono only.** The editorial serif is a marketing face and has
  no role on this surface.
- Large touch targets, a permanent keypad, live results, no Calculate button
- Empty and invalid states handled explicitly, never a crash or a blank

---

## Build order

1. ~~Project scaffold, TypeScript, Expo Router, running on a real device~~ **done**
2. ~~`DESIGN.md` settled~~ **done** — core screens designed
3. `src/theme.ts` from the design tokens, Inter and JetBrains Mono loading
4. Shared components — screen shell, zone, input well, keypad, warning line
5. Home screen with navigation to five empty screens
6. `src/lib` calculation functions + unit tests, before any UI logic
7. Ohm's law screen — establishes the zone pattern and keypad wiring
8. Remaining four screens
9. About screen, with the Nordrift lockup
10. Polish: empty states, invalid input, edge cases
11. App icon and splash
12. Store assets and listing
13. Internal test on own devices
14. Closed test, 12–15 testers, 14 days
15. Production application

---

## Naming

**Volt, by Nordrift.**

The product carries its own name. Nordrift is the company behind it, not a prefix. Store listing title is `Volt`, developer name is `Nordrift`.

The About screen uses the parent system's sub-brand lockup: the product name in
the grotesque at weight 700, with `BY NORDRIFT` in JetBrains Mono uppercase at
eyebrow scale beneath it. In-app attribution reads "Nordrift". The legal entity
name, Nordrift Technologies Limited, appears only in terms and legal copy —
never in the interface.

This sets the convention for every Nordrift product after this one. Reversible now, expensive to reverse later.

---

## v2 candidates, ranked

1. Pinout reference — ESP32, Arduino, Raspberry Pi GPIO
2. SMD resistor and capacitor code decoding
3. Series/parallel combination
4. RC filter cutoff and time constant
5. Battery life estimator
6. PCB trace width (IPC-2221)

Number 1 is the genuine differentiator and sits closest to Nordrift's robotics and embedded positioning. Save it as the v2 headline feature rather than diluting v1.
