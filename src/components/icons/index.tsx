import Svg, { Line, Path, Rect } from "react-native-svg";

export type ToolIconProps = {
  color: string;
  size?: number;
};

const DEFAULT_SIZE = 22;
const PRIMARY = 1.7;
const SECONDARY = 1.3;

export function ResistorIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={1} y1={12} x2={6} y2={12} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
      <Line x1={18} y1={12} x2={23} y2={12} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
      <Rect x={6} y={8} width={12} height={8} rx={2} stroke={color} strokeWidth={PRIMARY} strokeLinejoin="round" />
      <Line x1={9} y1={8.5} x2={9} y2={15.5} stroke={color} strokeWidth={SECONDARY} strokeLinecap="round" />
      <Line x1={12} y1={8.5} x2={12} y2={15.5} stroke={color} strokeWidth={SECONDARY} strokeLinecap="round" />
      <Line x1={15} y1={8.5} x2={15} y2={15.5} stroke={color} strokeWidth={SECONDARY} strokeLinecap="round" />
    </Svg>
  );
}

// A stroked Ω, not a text glyph — every other icon here is line art with a
// transparent fill, and a solid rendered letterform read visibly heavier.
export function OhmsLawIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 18.5 L7 12.5 C7 8 9 5 12 5 C15 5 17 8 17 12.5 L17 18.5"
        stroke={color}
        strokeWidth={PRIMARY}
        strokeLinecap="round"
        fill="none"
      />
      <Line x1={5.3} y1={18.5} x2={8.7} y2={18.5} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
      <Line x1={15.3} y1={18.5} x2={18.7} y2={18.5} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
    </Svg>
  );
}

// Vertical line kept to a ~14-unit span (y 5→19), matching the other four —
// it previously ran edge to edge (y 2→22) and visibly outscaled its siblings.
export function VoltageDividerIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={7} y1={5} x2={7} y2={19} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
      <Rect x={4.5} y={6.5} width={5} height={5} rx={1} stroke={color} strokeWidth={PRIMARY} strokeLinejoin="round" />
      <Rect x={4.5} y={13} width={5} height={5} rx={1} stroke={color} strokeWidth={PRIMARY} strokeLinejoin="round" />
      <Line x1={7} y1={12} x2={19.5} y2={12} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
      <Path
        d="M17.3 9.7 L20 12 L17.3 14.3"
        stroke={color}
        strokeWidth={PRIMARY}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LedResistorIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 6 L5 18 L15 12 Z" stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={15} y1={6} x2={15} y2={18} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
      <Line x1={2} y1={12} x2={5} y2={12} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
      <Line x1={15} y1={12} x2={22} y2={12} stroke={color} strokeWidth={PRIMARY} strokeLinecap="round" />
      <Path
        d="M13 8 L17 4 M14.5 4.5 L17 4 L17 6.5"
        stroke={color}
        strokeWidth={SECONDARY}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 11 L19.5 7 M17 7 L19.5 7 L19.5 9.5"
        stroke={color}
        strokeWidth={SECONDARY}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Outlined bars, not filled — matches the line-art fill style of the other
// four (was solid-filled, which also made it read heavier than its siblings).
// Baseline (y=19) and top bound (y=5) now match the ~14-unit span the other
// icons sit in, rather than running taller at y 3→21.
export function ESeriesIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={14.5} width={3.2} height={4.5} rx={0.8} stroke={color} strokeWidth={PRIMARY} strokeLinejoin="round" />
      <Rect x={8} y={11.5} width={3.2} height={7.5} rx={0.8} stroke={color} strokeWidth={PRIMARY} strokeLinejoin="round" />
      <Rect x={13} y={8.5} width={3.2} height={10.5} rx={0.8} stroke={color} strokeWidth={PRIMARY} strokeLinejoin="round" />
      <Rect x={18} y={5} width={3.2} height={14} rx={0.8} stroke={color} strokeWidth={PRIMARY} strokeLinejoin="round" />
    </Svg>
  );
}
