/**
 * @format
 */

import 'react-native';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-config', () => ({
  API_URL: 'http://localhost:3000',
}));

jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockResolvedValue(false),
  useHideAnimation: jest.fn().mockReturnValue({
    container: {},
    logo: { source: 0 },
    brand: { source: 0 },
  }),
}));

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    LongPressGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    NativeViewGestureHandler: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
