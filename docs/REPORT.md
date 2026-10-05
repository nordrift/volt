# Volt: technical report

**Project:** Volt, an offline electronics bench calculator for Android
**Author:** Rayhan M., for Nordrift
**Version:** 1.0.0 (versionCode 4), submitted to Google Play
**Stack:** React Native 0.86, Expo SDK 57, TypeScript (strict), Jest

---

## 1. Summary

Volt is a five-tool calculator for people working at an electronics bench: resistor colour codes, Ohm's law, voltage dividers, LED series resistors and standard (E-series) value lookup. It runs fully offline, requests no permissions, and stores nothing except the user's theme choice.

The project's main engineering decision is to keep all of the maths in a pure TypeScript layer (`src/lib`) with no dependency on the UI. That layer is covered by 75 unit tests across five suites, all passing. The UI is a set of thin screens built on one shared layout and a hand-built numeric keypad.

## 2. Problem

Resistor and Ohm's law calculators are among the most common utility apps on the Play Store, and most share the same problems:

- **Slow to a first answer.** Splash screens, ads and onboarding come before the tool.
- **Network and permissions they don't need.** Most request internet access for ads and analytics.
- **Unstable layouts.** The system keyboard slides in over the fields it is editing, and its layout varies between Android manufacturers.
- **Ambiguous results.** Typed and calculated values often share one list, told apart only by colour.
- **Tools that don't connect.** Sizing a voltage divider gives a value like 3.47 kΩ, but finding the nearest buyable part means switching to another app and retyping it.

## 3. Requirements

From [`PRODUCT.md`](PRODUCT.md):

| Requirement | How it is met |
| :--- | :--- |
| Works with no connection | No networking code; `INTERNET` permission explicitly blocked in `app.json` |
| Zero permissions | Permissions Expo would otherwise add are explicitly listed under `blockedPermissions` |
| Every result correct | Calculations isolated in `src/lib` and tested against hand-verifiable values |
| Usable one-handed | Fixed 12-key keypad at the bottom of every tool screen; inputs sit within thumb reach |
| Fast to an answer | No onboarding, no Calculate button: results update on every keypress |
| Nothing stored | Only the light/dark preference is persisted (AsyncStorage) |

Scope was fixed before building. SMD codes, capacitor codes, series/parallel, RC filters, 555 timers, unit conversion, history and settings were all deliberately left out of v1 so that it would ship.

## 4. Design

### 4.1 Screen anatomy

Every tool screen uses the same four stacked zones:

```
┌──────────────────────────┐
│ Header       back, reset │
├──────────────────────────┤
│ Calculated               │  results only
├──────────────────────────┤
│ Entered                  │  what the user typed
├──────────────────────────┤
│ Keypad                   │  fixed, always visible
└──────────────────────────┘
```

The core rule is that **nothing the user typed ever appears in the Calculated zone**. The difference between input and output is carried by position first and colour second, so a screen still reads correctly in greyscale or for a colour-blind user.

Ohm's law is the one tool that produces two answers. Both are shown at equal weight because neither is more "primary" than the other from the user's point of view. Tapping a calculated value turns it into an input and releases the older of the two existing inputs back to calculated.

### 4.2 Keypad

The system keyboard is replaced by an in-app 12-key pad that is always on screen. This removes three problems at once: the layout never shifts, every key is sized for a thumb, and behaviour no longer depends on the phone manufacturer's keyboard. It is built from `Pressable` components with no third-party dependency.

### 4.3 Visual system

All colour, type, spacing and radius values live in [`src/theme.ts`](../src/theme.ts) and come from [`DESIGN.md`](DESIGN.md). Components contain no literal values.

- **Two themes, one set of token names.** Light is the default; dark is a toggle in the Home header. Only token values change between them.
- **Accent per theme.** The brand indigo (`#3C3A63`) has only 1.98:1 contrast on black, so it is used on the light theme only. The dark theme uses a lighter frost/fjord pair instead.
- **No shadows or gradients.** Surfaces are separated by contrast and 1 px hairlines.
- **Colour signals state.** The exceptions are the resistor bands, drawn in their real colours because they are standardised data, and one muted hue per tool on the Home screen.
- **Two typefaces.** Inter for labels, JetBrains Mono for numbers so that digits keep their width while values update live.

## 5. Implementation

### 5.1 Architecture

```
src/app/          screens (Expo Router, stack navigation)
src/components/   shared UI primitives
src/lib/          pure calculation functions + tests
src/theme.ts      tokens + theme store
plugins/          Expo config plugins
```

Every calculation is an exported pure function in `src/lib` that takes numbers and returns a typed result or throws a descriptive error. Screens only translate keypad input into numbers, call these functions, and render the result or the error message. Keeping the two apart made it possible to write and test all the maths before any UI existed.

### 5.2 Calculation layer

**Ohm's law (`solveOhmsLaw`).** Accepts exactly two of V, I, R and P and solves for the other two across all six input pairs. Voltage and current may be negative (reverse polarity), but any combination implying negative resistance or negative power is rejected. Edge cases are handled explicitly: a short circuit (R = 0) with zero voltage is valid, while zero resistance with a non-zero voltage is rejected, as are combinations that leave a value indeterminate. When only R and P are known, the sign of V and I cannot be determined, so the non-negative root is returned by convention.

**E-series (`findNearestStandardValues`).** E12 and E24 are transcribed from the published IEC 60063 tables, because the historical values are not pure logarithmic rounding. E96 is generated from its definition, 10^(n/96) rounded to three significant figures, which is more reliable than typing 96 values by hand. When base values are scaled across decades, results are rounded to strip floating-point noise (for example `1.1 × 100 = 110.00000000000001`). The function returns the nearest value, the nearest below and above, and the percentage error of each.

**Voltage divider (`suggestVoltageDividerPairs`).** Reverse mode finds standard R1/R2 pairs for a target output. Instead of searching every R1 × R2 combination, it uses the fact that each candidate R1 has exactly one ideal R2:

```
R2 = R1 × ratio / (1 − ratio),   ratio = Vout / Vin
```

That ideal R2 is snapped to the nearest standard value and the pair is ranked by output error. This makes the search linear in the number of standard values rather than quadratic. The screen runs it over E12, E24 and E96, merges the results so that each pair keeps its easiest-to-source series label, and shows the ten best.

**LED series resistor (`calculateLedSeriesResistor`).** Computes R = (Vs − Vf) / If and P = (Vs − Vf) × If, rounds up to the next standard value, and flags dissipation above ¼ W. Vs = Vf is rejected rather than returning R = 0, since there is no headroom for a resistor to do anything.

**Resistor colour code (`bandsToValue`, `valueToBands`).** Bidirectional for 4, 5 and 6-band parts, including sub-ohm values using gold and silver multipliers. Encoding rounds to the band count's significant figures and correctly carries into the next decade at a boundary (for example, 999.6 Ω on a 4-band part becomes 1 kΩ, brown-black-red). A round-trip test checks that encoding and then decoding returns the original value within rounding tolerance.

### 5.3 Theme state

The theme is the only state every screen needs. Instead of React Context or a state library, it lives in a small module-level store read through `useSyncExternalStore`. On first launch it follows the system colour scheme; once the user taps the toggle, that choice is saved to AsyncStorage and restored on the next launch.

Two visual bugs came out of this during development and were fixed:

- **White flash when navigating in dark mode.** The native root view behind the navigation stack stayed white and showed through during transitions. The root layout now sets the native background colour with `expo-system-ui` whenever the theme changes.
- **Status bar ignoring the in-app toggle.** With no `StatusBar` component, the system bar followed the device's colour scheme rather than Volt's. It is now set explicitly from the active theme.

### 5.4 Android build

Two custom Expo config plugins cover gaps in the standard tooling:

- **`withSplashBranding`** adds the Android 12+ splash branding image, which `expo-splash-screen` doesn't support, by writing a `values-v31` style override that repeats every item of the base splash style.
- **`withReleaseMinification`** turns on R8 for release builds. This shrinks the app and embeds the deobfuscation mapping in the App Bundle, which clears Play Console's missing-mapping-file warning.

Unused template dependencies (`expo-image`, `expo-web-browser`, `react-native-web`, `expo-linear-gradient` and others) were removed because autolinked native modules ship in the APK whether or not the JavaScript uses them.

## 6. Testing

Tests cover the calculation layer only. Screens are thin wrappers around these functions and were tested manually on Android devices.

| Suite | Tests | Focus |
| :--- | ---: | :--- |
| `ohms-law.test.ts` | 27 | All six input pairs; input count; sign conventions; short and open circuit edge cases |
| `resistor-colour-code.test.ts` | 14 | 4/5/6-band decode; encode; sub-ohm values; decade carry; round-trip |
| `e-series.test.ts` | 13 | Series sizes; E12 ⊂ E24; E96 formula; nearest/below/above; ties; range limits |
| `voltage-divider.test.ts` | 13 | Forward formula; R1 or R2 = 0; ranking; internal consistency of suggestions |
| `led-resistor.test.ts` | 8 | Known values; ¼ W boundary; rounding up; invalid input |
| **Total** | **75** | **All passing** |

Expected values are chosen to be checkable by hand. For example, a 5 V supply with a 2 V red LED at 20 mA gives 150 Ω at 0.06 W, and brown-black-red-gold is 1 kΩ ±5%.

```bash
npm test
```

## 7. Release

- Package ID `dev.nordrift.volt`, built as an Android App Bundle with EAS Build.
- No permissions and no data collection, so the Play Data Safety form is all "no".
- Store listing assets are in [`store/`](../store).
- Status: submitted to Google Play and in review.

## 8. Limitations and future work

- **Screen-level tests.** Interaction logic such as Ohm's law's input hand-over is only tested by hand. Component tests with React Native Testing Library would be the next step.
- **Android only.** The code is cross-platform, but iOS has not been built or tested.
- **Fixed series.** Only E12, E24 and E96 are supported; E48 and E192 are easy additions on the same generator.

Planned v2 tools, in priority order: pinout reference (ESP32, Arduino, Raspberry Pi GPIO), SMD resistor and capacitor codes, series/parallel combinations, RC filter cutoff, battery life estimation, and PCB trace width (IPC-2221).

## 9. Outcome

Volt v1 meets its specification: five tools, no network access, no permissions, one persisted value, and a fully tested calculation layer. The most useful decision was writing the maths as pure, tested functions before building any screen: the UI could then be reworked repeatedly without putting the results at risk.
