import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { PickerOption } from '../../components/Picker/PickerModal';
import LocalStorageProvider from '../storage/localStorage';
import { useColorScheme } from 'react-native';

interface App {
  // App:
  getActiveTheme: () => 'dark' | 'light';
  theme: appThemeType;
  setTheme: (theme: appThemeType) => void;
  // Modals:
  openModal: () => void;
  closeModal: () => void;
  setModalConfig: (config?: ModalProps) => void;
  modalConfig?: ModalProps;
  setActionButtonBusy: (isBusy: boolean) => void;
  // Pickers:
  pickerConfig?: PickerProps;
  setPickerConfig: (config?: PickerProps) => void;
  setPickerSelected: (item: PickerOption) => void;
}

export type ModalButtonConfig = {
  label?: string;
  onPress?: () => Promise<void>;
  isBusy?: boolean;
};

export type ModalProps = {
  title: string;
  content: string;
  confirmButton?: ModalButtonConfig;
  cancelButton?: ModalButtonConfig;
};

export type PickerProps = {
  title?: string;
  items: PickerOption[];
  onSelect: (item: PickerOption) => void;
  selected?: PickerOption;
  buttonLabel?: string;
};

const oopsModalConfig: ModalProps = {
  title: 'Oops!',
  content: 'Something went wrong. Please try again later',
};

export type appThemeType = 'Light' | 'Dark' | 'System';

export const AppContext = createContext({} as App);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [theme, setThemeState] = useState<appThemeType>('System');
  const [modalConfig, setModalConfig] = useState<ModalProps | undefined>(undefined);
  const [pickerConfig, setPickerConfig] = useState<PickerProps | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const savedTheme = await LocalStorageProvider.getString('theme');
      if (savedTheme) {
        setThemeState(savedTheme as appThemeType);
      } else {
        // save value to storage
        await LocalStorageProvider.setString('theme', theme as string);
      }
    };

    load();
  }, []);

  const setTheme = async (chosen: appThemeType) => {
    setThemeState(chosen);
    await LocalStorageProvider.setString('theme', chosen as string);
  };

  const openModal = () => {
    setModalConfig(oopsModalConfig);
  };

  const closeModal = () => {
    setModalConfig(undefined);
  };

  const setActionButtonBusy = (isBusy: boolean) => {
    if (modalConfig) {
      const config = { ...modalConfig };
      if (config.confirmButton) {
        config.confirmButton.isBusy = isBusy;
      }
      setModalConfig(config);
    }
  };

  const setPickerSelected = (item: PickerOption) => {
    if (pickerConfig) {
      const config = { ...pickerConfig };
      config.selected = item;
      setPickerConfig(config);
    }
  };

  const getActiveTheme = (): 'light' | 'dark' => {
    if (theme === 'System') {
      return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme === 'Dark' ? 'dark' : 'light';
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        getActiveTheme,
        openModal,
        closeModal,
        setModalConfig,
        setActionButtonBusy,
        modalConfig,
        pickerConfig,
        setPickerConfig,
        setPickerSelected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

export const useApp = () => useContext(AppContext);
