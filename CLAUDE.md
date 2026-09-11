# CLAUDE.md — Volt

Offline electronics bench calculator. Android first. React Native + Expo.

`PRODUCT.md` is what the app does. `DESIGN.md` is how it looks and is the source
of every colour, size and spacing value. `DESIGN.md` itself inherits from the
Nordrift system at `../../brand/DESIGN.md`. Read the first two before proposing
anything; read the third when a token's origin matters.

## Stack

| Thing | Version / choice |
|---|---|
| Expo SDK | 57 |
| React Native | 0.86.3 |
| React | 19.2.3 |
| TypeScript | 6.x, `strict: true` |
| Routing | Expo Router 57, file-based, stack only |
| State | React `useState`. No Redux, no Zustand, no context for app state |
| Storage | None |
| Styling | `StyleSheet` + `src/theme.ts`. No UI library |
| Type | `expo-font`, Inter 400/600 + JetBrains Mono 400/500 |
| Tests | Jest via `jest-expo`, on `src/lib` only |

## Layout

```
src/
  app/          # routes — one file per screen, stack navigation
  lib/          # pure calculation functions + their tests
  components/   # shared UI primitives
  theme.ts      # the tokens from DESIGN.md, nothing invented
assets/
  fonts/        # four files, no more
```

Path alias: `@/*` → `./src/*`. Import as `@/lib/ohms-law`, not `../../lib/ohms-law`.

## Architecture rule

Every calculation is a pure function in `src/lib`, exported, with no React import
and no dependency on any component. Screens import them and render the result.

This is non-negotiable. It is what makes the logic testable and the code legible
to an interviewer.

## Screen anatomy

Every tool screen is the same four stacked zones, top to bottom: header,
Calculated, Entered, keypad. Zones are separated by a 1px hairline and nothing
else — no cards, no radius, no elevation between them.

Nothing the user typed ever renders in the Calculated zone. That separation is
the app's core interaction rule, and it is carried by position. Colour
reinforces it; the layout alone would survive greyscale.

## Styling rules

- **No literal values in components.** Every colour, size, radius and spacing
  value comes from `src/theme.ts`. A hex code in a screen file is a bug.
- **Dark only.** No light mode, no `useColorScheme`, no toggle.
- **No indigo.** Volt runs the dark product surface, where the Nordrift system
  documents indigo as unreadable (1.98:1 on black). `accent-frost` is the
  dark-surface accent; `accent-fjord` carries focus and selection. If you find
  yourself reaching for `#3c3a63`, the register is wrong.
- **No shadows, no gradient depth.** Elevation is surface contrast plus a
  hairline. `elevation`, `shadowColor` and any gradient library are all wrong
  answers here.
- **Colour signals state, never decorates.** Frost for calculated values, fjord
  for focus and selection, sand for a warning, true band colours inside the
  resistor illustration. Nowhere else.
- **Mono is for numbers.** Readouts, values and keypad glyphs use JetBrains
  Mono. Labels, titles and captions use Inter. Never the reverse.
- **No serif.** The editorial face belongs to the marketing surface.
- **Radius only on touchable things** — 8 on wells, keys and segmented
  controls. Zones, rows and panels are square with hairline separators.
- **No mount animation.** Motion answers a user action or doesn't exist.

## Commands

```
npm start          # Metro
npm run android    # Metro + open on Android
npm test           # Jest, src/lib only
npx expo lint
npx expo-doctor    # dependency / config sanity check
```

## Constraints that are decisions, not oversights

- **Package ID `dev.nordrift.volt` is permanent.** Never change it.
- **No persistence.** Nothing is written to disk between sessions. Do not add
  AsyncStorage, MMKV, SQLite, or any cache.
- **No network.** No fetch, no SDK that phones home. No analytics, no crash
  reporting in v1.
- **No permissions.** Do not add a config plugin that requests one.
- **The keypad is hand-built and permanent.** Twelve keys, fixed to the bottom,
  always visible, never animated in or out. Do not replace it with the system
  keyboard, do not add `keyboardType`, do not install a keypad package. The
  fixed layout is the point.
- **Template dependencies were pruned deliberately** (`@expo/ui`,
  `expo-glass-effect`, `expo-symbols`, `expo-device`, `expo-image`,
  `expo-web-browser`, `react-dom`, `react-native-web`, `expo-linear-gradient`).
  Do not reinstall them. Autolinked native modules ship in the APK whether or
  not JS imports them.
- **External links use `Linking.openURL`** from `react-native`.
- **No new dependency without asking first.** Say what it is, what it costs in
  APK size, and what the alternative is.
- Out of scope for v1 is listed in `PRODUCT.md`. Treat that list as binding.

## Copy rules

Interface text is sentence case, active voice, no filler. Errors say what
happened and what to do, and never apologise. An empty value shows an em dash,
not a zero — zero is a real answer and must not be faked.

Attribution reads "Nordrift", never the legal long form. The About screen uses
the parent system's lockup: product name in Inter 600, `BY NORDRIFT` in
JetBrains Mono uppercase beneath it. That is the only uppercase text in the app.

## Working agreement

- Explain the approach before writing code. No code on the first pass unless asked.
- One feature per session.
- Tests for `src/lib`. No tests for screens at this stage.
- Never touch `.env`, keystores, or `credentials.json`.
