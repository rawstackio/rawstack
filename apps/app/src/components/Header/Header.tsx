import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../lib/theme';
import TextLogo from './TextLogo';
import IconButton from '../Button/IconButton';
import Cog from '../Icon/Items/Cog';
import { useAuth } from '../../lib/context/AuthContext.tsx';
import EmailVerificationNotification from '../Notification/EmailVerificationNotification.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootNavigatorParams } from '../../navigators/RootNavigator.tsx';

const Header = ({}) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const onAccountPress = () => {
    navigation.getParent<StackNavigationProp<RootNavigatorParams>>()?.navigate('Settings');
  };

  return (
    <View>
      <Container>
        <Spacer />
        <TextLogo />
        <Spacer>
          <IconButton
            style={{ opacity: 0.5, paddingTop: 2 }}
            onPress={onAccountPress}
            size={20}
            icon={Cog}
            testId={'header-accountButton'}
          />
        </Spacer>
      </Container>
      {user && !user.isVerified && <EmailVerificationNotification />}
    </View>
  );
};

const Container = styled.View`
  background: ${p => p.theme.background ?? 'transparent'};
  padding: 0 ${theme.layout.spacing}px ${theme.layout.spacing * 0.5}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
`;

const Spacer = styled.View`
  width: 28px;
  position: relative;
`;

export default Header;
