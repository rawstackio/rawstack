import React from 'react';
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TabBar from '../components/TabBar/TabBar';
import { RootNavigatorParams } from './RootNavigator';
import Dashboard from '../screens/Dashboard';

export type TabNavigatorParams = {
  Home: {};
  Events: {};
};

export type TabsNavigatorNavigationProp<S extends keyof TabNavigatorParams> = CompositeNavigationProp<
  StackNavigationProp<RootNavigatorParams, 'Dashboard'>,
  BottomTabNavigationProp<TabNavigatorParams, S>
>;

export type TabsNavigatorRouteProp<S extends keyof TabNavigatorParams> = RouteProp<TabNavigatorParams, S>;

export type TabNavigatorProps<S extends keyof TabNavigatorParams> = {
  navigation: TabsNavigatorNavigationProp<S>;
  route: TabsNavigatorRouteProp<S>;
};

const Stack = createBottomTabNavigator<TabNavigatorParams>();

const TabNavigator = () => (
  <Stack.Navigator
    tabBar={props => <TabBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name={'Home'} component={Dashboard} />
    <Stack.Screen name={'Events'} component={Dashboard} />
  </Stack.Navigator>
);

export default TabNavigator;
