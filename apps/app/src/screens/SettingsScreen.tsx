import React, { useEffect, useState } from 'react';
import Screen from '../components/Template/Screen';
import SecondaryHeader from '../components/Header/SecondaryHeader';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { useAuth } from '../lib/context/AuthContext';
import SettingsRow from '../components/Settings/SettingsRow';
import { Linking, useColorScheme } from 'react-native';
import { theme } from '../lib/theme';
import Lock from '../components/Icon/Items/Lock';
import Mail from '../components/Icon/Items/Mail';
import Sun from '../components/Icon/Items/Sun';
import Moon from '../components/Icon/Items/Moon';
import HelpCircle from '../components/Icon/Items/HelpCircle';
import Shield from '../components/Icon/Items/Shield';
import Feather from '../components/Icon/Items/Feather';
import { Icon } from '../components/Icon/Icon';
import ChevronRight from '../components/Icon/Items/ChevronRight';
import SettingsModal from '../components/Settings/SettingsModal';
import { appThemeType, useApp } from '../lib/context/AppContext';
import ChevronDown from '../components/Icon/Items/ChevronDown';
import Picker, { PickerItem } from '../components/Picker/Picker';
import Logout from '../components/Icon/Items/Logout';
import ThemeAwareText from '../components/Text/Text';
import Api from '../lib/api/Api.ts';

const SettingsScreen = () => {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useApp();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [edit, setEdit] = useState<undefined | 'email' | 'password'>(undefined);
  const navigation = useNavigation();
  const phoneTheme = useColorScheme();

  const { setModalConfig, closeModal, setActionButtonBusy } = useApp();

  // Here’s our resend handler,
  // defined in the main component scope rather than inline
  const handleResendVerification = async () => {
    if (!user) {
      return;
    }

    setActionButtonBusy(true);

    await Api.user.usersIdPatch(user.id, {
      email: user.unverifiedEmail,
    });

    initialEmailVerificationScreen();
  };

  const onUserNotificationPress = () => {
    setModalConfig({
      title: 'Unverified Email',
      content:
        'Your email is not yet verified! Check your email for the verification link or resend the verification link',
      confirmButton: {
        label: 'Resend',
        onPress: handleResendVerification,
      },
    });
  };

  const initialEmailVerificationScreen = () => {
    setModalConfig({
      title: 'Unverified Sent',
      content: 'Please check your email for the verification link',
      confirmButton: {
        label: 'Ok',
        onPress: async () => {
          setActionButtonBusy(false);
          closeModal();
        },
      },
    });
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const colorSchemes: appThemeType[] = ['Light', 'Dark', 'System'];

  const getColorOptions = (): PickerItem[] => {
    return colorSchemes.map(colorScheme => {
      return {
        label: colorScheme,
        onPress: () => {
          setTheme(colorScheme);
          setShowThemeSelector(false);
        },
      };
    });
  };

  const back = () => {
    navigation.goBack();
  };

  const accountSettings = () => {
    setEdit('email');
  };

  const passwordSettings = () => {
    setEdit('password');
  };

  const goTo = () => {
    Linking.openURL('https://rawstack.io');
  };

  const selectColorTheme = () => {
    setShowThemeSelector(true);
  };

  const onLogout = () => {
    logout();
  };

  return (
    <Screen hideHeader={true} edges={['bottom']}>
      <SecondaryHeader title={'Settings'} onBack={back} />
      <Content>
        <Section>
          <SectionHeading>Account</SectionHeading>
          {user?.unverifiedEmail && (
            <UnverifiedWrapper onPress={onUserNotificationPress}>
              <ThemeAwareText>{`Your email "${user?.unverifiedEmail}" is unverified!`}</ThemeAwareText>
              {!user.isVerified && (
                <ThemeAwareText>Many features will be restricted until you are verified</ThemeAwareText>
              )}
            </UnverifiedWrapper>
          )}
          <SettingsRow label={'Email'} top={true} onPress={accountSettings} icon={Mail}>
            <ThemeAwareText>{user?.email}</ThemeAwareText>
          </SettingsRow>
          <SettingsRow label={'Password'} onPress={passwordSettings} icon={Lock}>
            <ThemeAwareText>*********</ThemeAwareText>
          </SettingsRow>
        </Section>

        <Section>
          <SectionHeading>App</SectionHeading>
          <SettingsRow
            label={'Color Scheme'}
            onPress={selectColorTheme}
            top={true}
            bottom={true}
            icon={phoneTheme === 'dark' ? Moon : Sun}
          >
            <SettingsRowRight>
              <ThemeAwareText>{theme}</ThemeAwareText>
              <Arrow width={20} icon={ChevronDown} />
              {showThemeSelector && <Picker items={getColorOptions()} style={{ top: -48, zIndex: 20 }} />}
            </SettingsRowRight>
          </SettingsRow>
        </Section>

        <Section>
          <SectionHeading>About</SectionHeading>
          <SettingsRow label={'Help Center'} onPress={goTo} top={true} icon={HelpCircle}>
            <Arrow width={20} icon={ChevronRight} />
          </SettingsRow>
          <SettingsRow label={'Terms of use'} onPress={goTo} icon={Feather}>
            <Arrow width={20} icon={ChevronRight} />
          </SettingsRow>
          <SettingsRow label={'Privacy Policy'} onPress={goTo} icon={Shield}>
            <Arrow width={20} icon={ChevronRight} />
          </SettingsRow>
        </Section>

        <Section>
          <SettingsRow highlight={true} label={'Logout'} onPress={onLogout} top={true} bottom={true} icon={Logout} />
        </Section>
      </Content>

      <SettingsModal
        type={edit}
        onClose={() => {
          setEdit(undefined);
        }}
      />
    </Screen>
  );
};

const SettingsRowRight = styled.View`
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const UnverifiedWrapper = styled.Pressable`
  background: ${p => p.theme.primary};
  padding: ${theme.layout.spacing * 0.33}px ${theme.layout.spacing}px;
`;

const Arrow = styled(Icon)`
  color: ${p => p.theme.text};
`;

const Section = styled.View`
  padding: 12px 0 18px;
`;

const SectionHeading = styled.Text`
  padding: 0 12px 4px 24px;
  text-transform: uppercase;
  font-size: 12px;
  color: ${p => p.theme.text};
`;

const Content = styled.View``;

export default SettingsScreen;
