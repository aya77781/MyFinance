import { useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import SavingsScreen from '../screens/SavingsScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import OpportunitiesScreen from '../screens/OpportunitiesScreen';
import MarketScreen from '../screens/MarketScreen';
import Glyph from '../components/Glyph';
import { colors, ff } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Accueil: 'home',
  Transactions: 'list',
  Budget: 'wallet',
  Epargne: 'savings',
  Challenges: 'target',
  Opportunites: 'trending',
  Marche: 'news',
};

// Labels courts pour que les onglets tiennent dans la barre.
const LABELS = {
  Accueil: 'Accueil',
  Transactions: 'Activite',
  Budget: 'Budget',
  Epargne: 'Epargne',
  Challenges: 'Defis',
  Opportunites: 'Opport.',
  Marche: 'Marche',
};

export default function Tabs() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // 7 onglets : on resserre tout sur petit ecran pour eviter les libelles tronques.
  const compact = width < 400;
  // Tres etroit : on masque les libelles (icones seules) plutot que de les tronquer.
  const showLabel = width >= 340;
  const side = compact ? 8 : 16;
  const iconSize = compact ? (showLabel ? 19 : 22) : 21;
  const labelSize = compact ? 8.5 : 10;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#6E7C90',
        tabBarShowLabel: showLabel,
        tabBarStyle: {
          position: 'absolute',
          left: side,
          right: side,
          bottom: Math.max(insets.bottom, 10),
          height: 62,
          borderRadius: 28,
          backgroundColor: '#161F2D',
          borderWidth: 1,
          borderColor: colors.border,
          borderTopWidth: 1,
          paddingHorizontal: compact ? 3 : 8,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: compact ? 0 : 2,
          paddingHorizontal: 0,
        },
        tabBarActiveBackgroundColor: 'rgba(35,211,168,0.16)',
        tabBarLabel: LABELS[route.name],
        tabBarLabelStyle: {
          fontFamily: ff.semibold,
          fontSize: labelSize,
          letterSpacing: -0.2,
          marginTop: -1,
        },
        tabBarIcon: ({ color }) => <Glyph name={ICONS[route.name]} color={color} size={iconSize} />,
      })}
    >
      <Tab.Screen name="Accueil" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Marche" component={MarketScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Epargne" component={SavingsScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen name="Opportunites" component={OpportunitiesScreen} />
    </Tab.Navigator>
  );
}
