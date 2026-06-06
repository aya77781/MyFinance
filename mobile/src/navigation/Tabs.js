import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import SavingsScreen from '../screens/SavingsScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
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
  Marche: 'news',
};

// Labels courts pour que les 6 onglets tiennent dans la barre.
const LABELS = {
  Accueil: 'Accueil',
  Transactions: 'Activite',
  Budget: 'Budget',
  Epargne: 'Epargne',
  Challenges: 'Defis',
  Marche: 'Marche',
};

export default function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#6E7C90',
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom, 12),
          height: 64,
          borderRadius: 32,
          backgroundColor: '#161F2D',
          borderWidth: 1,
          borderColor: colors.border,
          borderTopWidth: 1,
          paddingHorizontal: 8,
          paddingTop: 9,
          paddingBottom: 9,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        },
        tabBarItemStyle: { borderRadius: 20, marginHorizontal: 2 },
        tabBarActiveBackgroundColor: 'rgba(35,211,168,0.16)',
        tabBarLabel: LABELS[route.name],
        tabBarLabelStyle: { fontFamily: ff.semibold, fontSize: 9.5, marginTop: -2 },
        tabBarIcon: ({ color }) => <Glyph name={ICONS[route.name]} color={color} size={21} />,
      })}
    >
      <Tab.Screen name="Accueil" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Marche" component={MarketScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Epargne" component={SavingsScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
    </Tab.Navigator>
  );
}
