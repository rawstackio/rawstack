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

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<appThemeType>('Dark');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerAction, setDrawerAction] = useState<DrawerAction | undefined>(undefined);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    const load = async () => {
      const savedTheme = await LocalStorageProvider.getString('theme');

      if (savedTheme) {
        setThemeState(savedTheme as unknown as appThemeType);
      } else {
        await LocalStorageProvider.setString('theme', theme as string);
      }

      if (savedTheme === 'Light') {
        document.documentElement.classList.remove('dark');
      }
    };

    load();
  }, []);

  const setTheme = async (chosen: appThemeType) => {
    setThemeState(chosen);

    document.documentElement.classList.toggle(
      'dark',
      // localStorage.theme === "dark" ||
      // (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
    );

    await LocalStorageProvider.setString('theme', chosen as string);
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
