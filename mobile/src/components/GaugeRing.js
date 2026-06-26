import { View } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

// Anneau de progression facon jauge (style dashboard fintech) :
// un rail de fond + un arc colore a coins arrondis. progress = 0..1.
// `colorEnd` active un degrade le long de l'arc ; sinon couleur pleine.
export default function GaugeRing({
  progress = 0,
  size = 220,
  strokeWidth = 20,
  color = colors.primary,
  colorEnd,
  track = colors.track,
  children,
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  const dash = p * circ;
  const gradId = 'gauge-grad';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {colorEnd ? (
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={color} />
              <Stop offset="1" stopColor={colorEnd} />
            </LinearGradient>
          </Defs>
        ) : null}
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={track}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {p > 0 ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={colorEnd ? `url(#${gradId})` : color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeLinecap="round"
              fill="none"
            />
          ) : null}
        </G>
      </Svg>
      {children}
    </View>
  );
}
