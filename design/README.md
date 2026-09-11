# Design references

Source mockups for the home screen, approved [date you're pasting this].

- `Volt_Home-selection-light.png` — light theme, default
- `Volt_Home-selection-dark.png` — dark theme, same tokens with swapped values

## Locked decisions

- Row height is content-sized, not stretched to fill the screen. Empty
  space below row 5 is intentional headroom for future tools — don't
  "fix" it by re-stretching rows.
- Icon chip (38dp) + title + subtitle + chevron, one glyph and hue per
  tool. Ohm's law anchors the brand accent (#3C3A63); the other four
  are muted variants that sit beneath it.
- Custom SVG icons per tool, not stock icon-set glyphs.
- One themed screen driven by tokens (light default), not two separate
  static screens — new screens should inherit the same theme object.
- Header includes a light/dark toggle next to "About". Persists via
  storage; defaults to system scheme on first launch.

If a future change touches this screen's layout, update this file and
the mockups together so they don't drift from what's actually shipped.