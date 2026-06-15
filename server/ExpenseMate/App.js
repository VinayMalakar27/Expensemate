import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import DashboardScreen from './screens/Dashboard';
import AddExpenseScreen from './screens/AddExpense';
import ExpensesScreen from './screens/Expenses';
import AIChatScreen from './screens/AIChat';
import AnalyticsScreen from './screens/Analytics';
import ProfileScreen from './screens/Profile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1E1E2E',
        borderTopColor: '#2E2E3E',
        paddingBottom: 12,
        paddingTop: 8,
        height: 70,
      },
      tabBarActiveTintColor: '#6C63FF',
      tabBarInactiveTintColor: '#666',
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }}
    />
    <Tab.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={{ tabBarLabel: 'Add', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text> }}
    />
    <Tab.Screen
      name="Expenses"
      component={ExpensesScreen}
      options={{ tabBarLabel: 'Expenses', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💰</Text> }}
    />
    <Tab.Screen
      name="AIChat"
      component={AIChatScreen}
      options={{ tabBarLabel: 'AI Chat', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🤖</Text> }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="AnalyticsModal" component={AnalyticsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                background: '#0F0F1A',
                card: '#1E1E2E',
                text: '#FFFFFF',
                border: '#2E2E3E',
                primary: '#6C63FF',
                notification: '#6C63FF',
              },
            }}
          >
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}