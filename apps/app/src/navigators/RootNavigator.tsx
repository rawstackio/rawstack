import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../lib/context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import Settings from '../screens/SettingsScreen';
import TabNavigator from './TabNavigator';

export type RootNavigatorParams = {
  Dashboard: undefined;
  Settings: undefined;
  Auth: undefined;
};

const Stack = createStackNavigator<RootNavigatorParams>();

const RootNavigator = () => {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!!user ? (
        <>
          <Stack.Screen name="Dashboard" component={TabNavigator} />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{
              presentation: 'modal',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
