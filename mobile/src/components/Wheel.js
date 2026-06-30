import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import Svg, { G, Path, Circle, Polygon, Text as SvgText } from 'react-native-svg';
import { colors, ff } from '../theme';

// Roue de la fortune colorée, 100 % SVG + Animated (aucune dépendance native).
// - `segments` : [{ label, color }] (un segment par activité restante).
// - via la ref : `spinTo(index, onEnd)` fait tourner la roue jusqu'à ce que le
//   segment `index` s'arrête sous le pointeur (en haut), puis appelle `onEnd`.
//
// Le tirage aléatoire est décidé par l'écran (pour pouvoir persister le
// résultat) ; la roue se contente d'animer l'arrivée sur le bon segment.

// Coordonnée d'un point sur le cercle, angle mesuré en degrés dans le sens
// horaire à partir du haut (12 h).
function pointOnCircle(cx, cy, r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
}

function truncate(s = '', max = 12) {
  const str = String(s);
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

const Wheel = forwardRef(function Wheel({ segments = [], size = 280 }, ref) {
  const rot = useRef(new Animated.Value(0)).current; // rotation cumulée en degrés
  const current = useRef(0); // dernière valeur atteinte (pour repartir de là)

  useImperativeHandle(ref, () => ({
    spinTo(index, onEnd) {
      const n = segments.length;
      if (!n) return;
      const seg = 360 / n;
      const center = index * seg + seg / 2; // angle du centre du segment visé
      const landing = (360 - (center % 360)) % 360; // rotation pour l'amener en haut
      const turns = 360 * 5; // 5 tours complets pour le fun
      const start = current.current;
      const target = Math.ceil(start / 360) * 360 + turns + landing;
      current.current = target;

      Animated.timing(rot, {
        toValue: target,
        duration: 3600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        if (finished && onEnd) onEnd();
      });
    },
  }));

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const n = segments.length;
  const seg = n > 0 ? 360 / n : 360;

  const spin = rot.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ width: size, height: size + 18, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ width: size, height: size, transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size}>
          {/* Anneau extérieur */}
          <Circle cx={cx} cy={cy} r={r + 4} fill={colors.surface} stroke={colors.border} strokeWidth={3} />

          {n === 0 ? (
            <Circle cx={cx} cy={cy} r={r} fill={colors.track} />
          ) : n === 1 ? (
            <>
              <Circle cx={cx} cy={cy} r={r} fill={segments[0].color} />
              <SvgText
                x={cx}
                y={cy - r * 0.55}
                fill="#08221C"
                fontSize={15}
                fontFamily={ff.bold}
                textAnchor="middle"
              >
                {truncate(segments[0].label)}
              </SvgText>
            </>
          ) : (
            segments.map((s, i) => {
              const a0 = i * seg;
              const a1 = (i + 1) * seg;
              const p0 = pointOnCircle(cx, cy, r, a0);
              const p1 = pointOnCircle(cx, cy, r, a1);
              const largeArc = seg > 180 ? 1 : 0;
              const d = `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`;
              const mid = a0 + seg / 2;
              const label = pointOnCircle(cx, cy, r * 0.62, mid);
              return (
                <G key={i}>
                  <Path d={d} fill={s.color} stroke="rgba(8,16,28,0.45)" strokeWidth={2} />
                  <SvgText
                    x={label.x}
                    y={label.y + 4}
                    fill="#08221C"
                    fontSize={n > 8 ? 10 : 12.5}
                    fontFamily={ff.bold}
                    textAnchor="middle"
                  >
                    {truncate(s.label, n > 8 ? 8 : 12)}
                  </SvgText>
                </G>
              );
            })
          )}

          {/* Moyeu central */}
          <Circle cx={cx} cy={cy} r={18} fill={colors.bg} stroke={colors.primary} strokeWidth={3} />
          <Circle cx={cx} cy={cy} r={5} fill={colors.primary} />
        </Svg>
      </Animated.View>

      {/* Pointeur fixe en haut, pointe vers le bas (dans la roue) */}
      <View style={{ position: 'absolute', top: -2, alignItems: 'center' }} pointerEvents="none">
        <Svg width={34} height={28}>
          <Polygon points="17,26 4,2 30,2" fill={colors.primary} stroke={colors.bg} strokeWidth={2} />
        </Svg>
      </View>
    </View>
  );
});

export default Wheel;
