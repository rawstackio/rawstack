import { Icon, IconElement } from '../Icon/Icon';
import React from 'react';
import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
import { StyleProp, ViewStyle } from 'react-native';

export type PickerItem = {
  label: string;
  icon?: IconElement;
  onPress: () => void;
};

interface Props {
  items: PickerItem[];
  style?: StyleProp<ViewStyle>;
}

const Picker = ({ items, style }: Props) => {
  const theme = useTheme();

  return (
    <Container
      style={[
        {
          zIndex: 2,
          shadowOpacity: 1,
          shadowRadius: 40,
          shadowColor: theme.shadow,
          shadowOffset: { height: 0, width: 0 },
        },
        style,
      ]}
    >
      {items.map((item, index) => (
        <Row key={index} onPress={item.onPress} top={index === 0}>
          <Text>{item.label}</Text>
          {item.icon && <Icon icon={item.icon} width={18} color={theme.text} />}
        </Row>
      ))}
    </Container>
  );
};

const Container = styled.View`
  background: ${p => p.theme.background};
  position: absolute;
  top: 36px;
  right: -12px;
  width: 170px;
  border-radius: 4px;
`;

const Row = styled.Pressable<{ top?: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 9px 18px;
  border-color: ${p => p.theme.inputBorder};
  border-top-width: ${p => (p.top ? 0 : 1)}px;
`;

const Text = styled.Text`
  color: ${p => p.theme.text};
`;

export default Picker;
