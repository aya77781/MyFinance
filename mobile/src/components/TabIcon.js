import Svg, { Rect, Circle, Path, Line, G } from 'react-native-svg';

// Icones geometriques dessinees a la main (aucune librairie d'icones, aucun emoji).
export default function TabIcon({ name, color, size = 24 }) {
  const sw = 2;
  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z"
            stroke={color}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'list':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <G stroke={color} strokeWidth={sw} strokeLinecap="round">
            <Line x1="8" y1="7" x2="20" y2="7" />
            <Line x1="8" y1="12" x2="20" y2="12" />
            <Line x1="8" y1="17" x2="20" y2="17" />
            <Circle cx="4" cy="7" r="1.2" fill={color} stroke="none" />
            <Circle cx="4" cy="12" r="1.2" fill={color} stroke="none" />
            <Circle cx="4" cy="17" r="1.2" fill={color} stroke="none" />
          </G>
        </Svg>
      );
    case 'wallet':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="6" width="18" height="13" rx="3" stroke={color} strokeWidth={sw} />
          <Path d="M3 10 H21" stroke={color} strokeWidth={sw} />
          <Circle cx="16.5" cy="14" r="1.3" fill={color} />
        </Svg>
      );
    case 'savings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={sw} />
          <Path d="M12 8 V16 M9.5 9.8 C9.5 8.5 14.5 8.5 14.5 11 C14.5 13.5 9.5 12.8 9.5 15 C9.5 16 14.5 16 14.5 14.6"
            stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case 'challenge':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={sw} />
          <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={sw} />
          <Circle cx="12" cy="12" r="1.4" fill={color} />
        </Svg>
      );
    default:
      return null;
  }
}
