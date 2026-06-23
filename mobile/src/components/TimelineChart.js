import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Polyline, Circle, Line } from 'react-native-svg';
import { colors, ff } from '../theme';

// Graphe combine : barres du net par periode (vert/rouge) + ligne du cumul.
// data: [{ label, net, cumulative }]
export default function TimelineChart({ data = [] }) {
  if (!data.length) return null;

  const H = 150;
  const padTop = 14;
  const padBot = 8;
  const drawH = H - padTop - padBot;
  const step = 46;
  const barW = 20;
  const W = Math.max(data.length * step, step);

  const nets = data.map((d) => d.net);
  const cums = data.map((d) => d.cumulative);
  const netMin = Math.min(0, ...nets);
  const netMax = Math.max(0, ...nets);
  const cumMin = Math.min(0, ...cums);
  const cumMax = Math.max(0, ...cums);

  // Echelle generique : valeur -> y (haut = grand).
  const scale = (v, min, max) => {
    if (max === min) return padTop + drawH / 2;
    return padTop + drawH - ((v - min) / (max - min)) * drawH;
  };
  const netY = (v) => scale(v, netMin, netMax);
  const cumY = (v) => scale(v, cumMin, cumMax);
  const zeroY = netY(0);
  const cx = (i) => i * step + step / 2;
  const linePts = data.map((d, i) => `${cx(i)},${cumY(d.cumulative)}`).join(' ');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <Svg width={W} height={H}>
          {/* Ligne du zero pour les barres de net */}
          <Line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke={colors.border} strokeWidth={1} />
          {data.map((d, i) => {
            const y = netY(d.net);
            const top = Math.min(y, zeroY);
            const h = Math.max(2, Math.abs(zeroY - y));
            return (
              <Rect
                key={`b${i}`}
                x={cx(i) - barW / 2}
                y={top}
                width={barW}
                height={h}
                rx={4}
                fill={d.net >= 0 ? colors.positive : colors.negative}
                opacity={0.85}
              />
            );
          })}
          {/* Ligne du cumul */}
          <Polyline
            points={linePts}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, i) => (
            <Circle key={`c${i}`} cx={cx(i)} cy={cumY(d.cumulative)} r={2.6} fill="#FFFFFF" />
          ))}
        </Svg>
        <View style={[styles.labels, { width: W }]}>
          {data.map((d, i) => (
            <Text key={`l${i}`} style={[styles.label, { width: step }]} numberOfLines={1}>
              {d.label}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', marginTop: 6 },
  label: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: ff.semibold,
    fontSize: 11,
    textTransform: 'capitalize',
  },
});
