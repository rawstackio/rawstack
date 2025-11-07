// src/types/styled.d.ts
import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    // colors: {
    background: string;
    text: string;
    secondaryText: string;
    shadow: string;
    primary: string;
    secondary: string;
    inputColor: string;
    inputBackground: string;
    inputBorder: string;
    inputLabel: string;
    error: string;
    modalBackground: string;
    authBackground: string;
    settingsBorder: string;
    settingsGroupBackground: string;
    logoGray: string;
    logoWhite: string;
    // };
    // colors: {
    //   background: string;
    //   text: string;
    //   error: string;
    //   // add more as needed...
    // };
    // layout: {
    //   spacing: number; // base spacing unit
    // };
    // fonts: {
    //   logo: string;
    //   heading: string;
    //   headingBold: string;
    // };
  }
}
