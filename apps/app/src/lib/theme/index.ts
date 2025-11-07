import { DefaultTheme } from 'styled-components/native';

export const lightModeColors: DefaultTheme = {
  background: '#fafafa',
  text: '#000',
  secondaryText: '#ccc',
  shadow: '#ddd',
  primary: '#df009a',
  secondary: '#00df9a',
  inputColor: '#000',
  inputBackground: '#fff',
  inputBorder: '#ccc',
  inputLabel: '#aaa',
  error: '#770000',
  modalBackground: 'rgba(0, 0, 0, 0.8)',
  authBackground: 'rgba(0, 0, 0, 0.1)',
  settingsBorder: '#eee',
  settingsGroupBackground: '#fff',
  logoGray: '#555',
  logoWhite: '#222',
};

export const darkModeColors: DefaultTheme = {
  background: '#111',
  text: '#fff',
  secondaryText: '#ccc',
  shadow: '#000000',
  primary: '#ff00ba',
  secondary: '#00df9a',
  inputColor: '#fff',
  inputBackground: '#000',
  inputBorder: '#444',
  inputLabel: '#aaa',
  error: '#ff0000',
  modalBackground: 'rgba(50, 50, 50, 0.8)',
  authBackground: 'rgba(255, 255, 255, 0.07)',
  settingsBorder: '#333',
  settingsGroupBackground: '#151515',
  logoGray: '#999',
  logoWhite: '#eee',
};

export const theme = {
  colors: darkModeColors,
  layout: {
    spacing: 24,
  },
  fonts: {
    logo: 'BebasNeue-Regular',
    heading: 'Oswald-Light',
    headingBold: 'Oswald-Bold',
  },
  fontSizes: {
    heading: 24,
  },
};
