import { createContext, useContext, useRef, useState, useCallback } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, ff, shadow } from '../theme';

// Systeme de notifications ephemeres (toasts) global.
// Remplace les `console.warn(e.message)` silencieux : l'utilisateur voit enfin
// les erreurs reseau et les confirmations d'action. 100 % JS, aucune dependance
// native ajoutee (Animated est inclus dans React Native).

const ToastCtx = createContext(null);

const TYPES = {
  error: { color: colors.negative, icon: '!' },
  success: { color: colors.primary, icon: '✓' },
  info: { color: colors.textMuted, icon: 'i' },
};

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null); // { message, type }
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideTimer = useRef(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 20, duration: 180, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (message, type = 'info', duration = 3200) => {
      if (!message) return;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message: String(message), type });
      opacity.setValue(0);
      translateY.setValue(20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 9, tension: 80, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(hide, duration);
    },
    [opacity, translateY, hide]
  );

  const value = useRef({
    show,
    error: (m) => show(m, 'error', 4200),
    success: (m) => show(m, 'success', 2600),
    info: (m) => show(m, 'info'),
  });
  // On garde les callbacks a jour sans recreer l'objet (ref stable).
  value.current.show = show;
  value.current.error = (m) => show(m, 'error', 4200);
  value.current.success = (m) => show(m, 'success', 2600);
  value.current.info = (m) => show(m, 'info');

  const cfg = toast ? TYPES[toast.type] || TYPES.info : TYPES.info;

  return (
    <ToastCtx.Provider value={value.current}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { bottom: insets.bottom + spacing.xxl, opacity, transform: [{ translateY }] },
          ]}
        >
          <Animated.View style={[styles.toast, { borderLeftColor: cfg.color }]}>
            <Text style={[styles.icon, { color: cfg.color }]}>{cfg.icon}</Text>
            <Text style={styles.message} numberOfLines={3}>
              {toast.message}
            </Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </ToastCtx.Provider>
  );
}

// Hook principal. Renvoie { show, error, success, info }.
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Garde-fou : hors provider on degrade en console plutot que de crasher.
    return { show: () => {}, error: console.warn, success: () => {}, info: () => {} };
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadow,
    ...(Platform.OS === 'web' ? { boxShadow: '0 12px 32px rgba(0,0,0,0.4)' } : null),
  },
  icon: {
    fontFamily: ff.extrabold,
    fontSize: 15,
    width: 20,
    textAlign: 'center',
    marginRight: spacing.sm,
  },
  message: { flex: 1, color: colors.text, fontFamily: ff.semibold, fontSize: 14 },
});
