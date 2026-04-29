import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import LocalStorageProvider from '../storage/local-storage.ts';

interface App {
  theme: appThemeType;
  setTheme: (theme: appThemeType) => void;
  // temp
  drawerOpen: boolean;
  toggleDrawer: () => void;
  drawerAction?: {
    form: 'account';
    entityId: string | null;
    // onSuccess: () => {},
    // onError: () => {},
  };
  setDrawerAction: (action: DrawerAction | undefined) => void;
}

export type DrawerAction = App['drawerAction'];

export type appThemeType = 'Dark' | 'Light';

export const AppContext = createContext({} as App);

const applyTheme = (theme: appThemeType) => {
  document.documentElement.classList.toggle('dark', theme === 'Dark');
};

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<appThemeType>('Dark');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerAction, setDrawerAction] = useState<DrawerAction | undefined>(undefined);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    const savedTheme = LocalStorageProvider.getString('theme');
    const resolvedTheme: appThemeType = savedTheme === 'Light' ? 'Light' : 'Dark';

    setThemeState(resolvedTheme);
    applyTheme(resolvedTheme);

    if (!savedTheme) {
      LocalStorageProvider.setString('theme', resolvedTheme);
    }
  }, []);

  const setTheme = (chosen: appThemeType) => {
    setThemeState(chosen);

    applyTheme(chosen);
    LocalStorageProvider.setString('theme', chosen);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        drawerOpen,
        toggleDrawer,
        drawerAction,
        setDrawerAction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

export const useApp = () => useContext(AppContext);
