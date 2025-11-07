import React, { FC, PropsWithChildren } from 'react';
import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
import { View } from 'react-native';
import { Icon, IconElement } from '../Icon/Icon';
import Cog from '../Icon/Items/Cog';

interface Props {
  label: string;
  onPress: () => void;
  icon?: IconElement;
  top?: boolean;
  bottom?: boolean;
  highlight?: boolean;
}

const SettingsRow: FC<PropsWithChildren<Props>> = ({
  icon,
  onPress,
  label,
  children,
  top,
  bottom,
  highlight,
}) => {
  const colors = useTheme();

  return (
    <Container onPress={onPress} top={top} bottom={bottom}>
      <Left>
        <Icon
          icon={icon || Cog}
          width={16}
          color={highlight ? colors.primary : colors.text}
        />
      </Left>
      <Right bottom={bottom}>
        <Title highlight={highlight}>{label}</Title>
        <View>{children}</View>
      </Right>
    </Container>
  );
};

const Container = styled.Pressable<{ top?: boolean; bottom?: boolean }>`
  flex-direction: row;
  padding: 0 0 0 18px;
  background: ${p => p.theme.settingsGroupBackground};
  border: solid 0 ${p => p.theme.settingsBorder};
  border-bottom-width: ${p => (p.bottom ? 1 : 0)}px;
  border-top-width: ${p => (p.top ? 1 : 0)}px;
  border-color: ${p => p.theme.settingsBorder};
`;

const Right = styled.View<{ top?: boolean; bottom?: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  border: solid 1.5px transparent;
  border-bottom-color: ${p =>
    p.bottom ? 'transparent' : p.theme.settingsBorder};
  padding: 12px 24px 12px 12px;
  margin-left: 3px;
`;

const Left = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text<{ highlight?: boolean }>`
  color: ${p => (p.highlight ? p.theme.primary : p.theme.text)};
  font-size: 14px;
`;

export default SettingsRow;
