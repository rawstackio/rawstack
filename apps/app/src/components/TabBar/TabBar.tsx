import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import { NavigationHelpers, ParamListBase, TabNavigationState } from '@react-navigation/native';
import Sun from '../Icon/Items/Sun';
import Moon from '../Icon/Items/Moon';

interface Props {
  state: TabNavigationState<any>;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}

const TabBar: React.FC<Props> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const colors = useTheme();

  // Theme
  const iconSize = 26;
  const iconColor = colors.text;
  const iconColorActive = colors.primary;

  const renderButton = (index: number, key: string, name: string) => {
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(name);
      }
    };

    return (
      <Button key={key} onPress={onPress}>
        {name === 'Events' ? (
          <Sun width={iconSize} height={iconSize} color={isFocused ? iconColorActive : iconColor} />
        ) : (
          <Moon width={iconSize} height={iconSize} color={isFocused ? iconColorActive : iconColor} />
        )}
      </Button>
    );
  };

  return (
    <View
      style={{
        backgroundColor: 'green',
        shadowOpacity: 0.75,
        shadowRadius: 2,
        shadowColor: colors.shadow,
        shadowOffset: { height: 1, width: 0 },
      }}
    >
      <Container bottomPadding={Math.max(insets.bottom, 24)}>
        <ButtonWrapper>{state.routes.map((route, index) => renderButton(index, route.key, route.name))}</ButtonWrapper>
      </Container>
    </View>
  );
};

const Container = styled.View<{ bottomPadding: number }>`
  background: ${p => p.theme.background};
  padding-bottom: ${props => props.bottomPadding}px;
`;

const ButtonWrapper = styled.View`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const Button = styled.Pressable`
  padding: 18px 8px 4px;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default TabBar;
