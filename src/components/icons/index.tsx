import Svg, { Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { fontFamilies } from "@/theme";

export type ToolIconProps = {
  color: string;
  size?: number;
};

const DEFAULT_SIZE = 22;

export function ResistorIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={1} y1={12} x2={6} y2={12} stroke={color} strokeWidth={1.6} />
      <Line x1={18} y1={12} x2={23} y2={12} stroke={color} strokeWidth={1.6} />
      <Rect x={6} y={8} width={12} height={8} rx={2} stroke={color} strokeWidth={1.6} />
      <Line x1={9} y1={8.5} x2={9} y2={15.5} stroke={color} strokeWidth={1.3} />
      <Line x1={12} y1={8.5} x2={12} y2={15.5} stroke={color} strokeWidth={1.3} />
      <Line x1={15} y1={8.5} x2={15} y2={15.5} stroke={color} strokeWidth={1.3} />
    </Svg>
  );
}

export function OhmsLawIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <SvgText
        x={12}
        y={17.5}
        fontSize={16}
        fontFamily={fontFamilies.monoRegular}
        fill={color}
        textAnchor="middle"
      >
        Ω
      </SvgText>
    </Svg>
  );
}

export function VoltageDividerIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={7} y1={2} x2={7} y2={22} stroke={color} strokeWidth={1.6} />
      <Rect x={4.5} y={4} width={5} height={5} rx={1} stroke={color} strokeWidth={1.6} />
      <Rect x={4.5} y={15} width={5} height={5} rx={1} stroke={color} strokeWidth={1.6} />
      <Line x1={7} y1={12} x2={20} y2={12} stroke={color} strokeWidth={1.6} />
      <Path d="M17.5 9.5 L20.5 12 L17.5 14.5" stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

export function LedResistorIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 6 L5 18 L15 12 Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Line x1={15} y1={6} x2={15} y2={18} stroke={color} strokeWidth={1.6} />
      <Line x1={2} y1={12} x2={5} y2={12} stroke={color} strokeWidth={1.6} />
      <Line x1={15} y1={12} x2={22} y2={12} stroke={color} strokeWidth={1.6} />
      <Path d="M13 8 L17 4 M14.5 4.5 L17 4 L17 6.5" stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15.5 11 L19.5 7 M17 7 L19.5 7 L19.5 9.5" stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ESeriesIcon({ color, size = DEFAULT_SIZE }: ToolIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={16} width={3.2} height={5} rx={0.5} fill={color} />
      <Rect x={8} y={12} width={3.2} height={9} rx={0.5} fill={color} />
      <Rect x={13} y={7} width={3.2} height={14} rx={0.5} fill={color} />
      <Rect x={18} y={3} width={3.2} height={18} rx={0.5} fill={color} />
    </Svg>
  );
}
