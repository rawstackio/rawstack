import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components';
import { DefaultTheme } from 'styled-components/native';
import RootNavigator from '../../navigators/RootNavigator';
import { StatusBar } from 'react-native';
import Modal from '../Modal/Modal';
import Picker from '../Picker/PickerModal';
import { darkModeColors, lightModeColors } from '../../lib/theme';
import { useApp } from '../../lib/context/AppContext';
import Toast from 'react-native-toast-message';
import toastConfig from '../../lib/toast/config';

const AppContainer = () => {
  const { getActiveTheme } = useApp();

  const getColors = (): DefaultTheme => {
    return getActiveTheme() === 'dark' ? darkModeColors : lightModeColors;
  };

  return (
    <ThemeProvider theme={getColors()}>
      <NavigationContainer>
        <StatusBar
          backgroundColor={getColors().background}
          barStyle={
            getActiveTheme() === 'dark' ? 'light-content' : 'dark-content'
          }
        />
        <RootNavigator />
        <Modal />
        <Picker />
        <Toast config={toastConfig} />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default AppContainer;
