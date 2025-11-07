import React from 'react';
import { Modal, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
import CloseButton from '../Button/CloseButton';
import Button from '../Button/Button';
import { useApp } from '../../lib/context/AppContext';
import { theme } from '../../lib/theme';

const width = Dimensions.get('window').width;

export type PickerOption = {
  value: string;
  label: string;
};

export const PickerModal = () => {
  const colors = useTheme();

  const { pickerConfig, setPickerConfig } = useApp();
  const [selected, setSelected] = React.useState<string | undefined>(
    pickerConfig?.selected ? pickerConfig.selected.value : undefined,
  );

  const getItems = (): PickerOption[] => {
    if (pickerConfig) {
      return pickerConfig.items;
    }

    return [];
  };

  const closePicker = () => {
    setPickerConfig(undefined);
  };

  const onValueChane = (item: string) => {
    setSelected(item);
    const selectedOption = getItems().find(i => i.value === item);
    if (selectedOption && pickerConfig?.onSelect) {
      pickerConfig?.onSelect(selectedOption);
    }
  };

  return (
    <Modal
      visible={!!pickerConfig}
      animationType={'fade'}
      transparent={true}
      presentationStyle="overFullScreen"
    >
      <ModalContainer>
        <ModalContentContainer>
          <ModalCloseButton onPress={closePicker} size={24} />
          <ModalHeading>{pickerConfig?.title ?? 'Choose'}</ModalHeading>
          <ModalContent>
            <Picker
              itemStyle={{
                color: colors.text,
              }}
              style={{
                width: width - 48,
              }}
              selectedValue={selected}
              onValueChange={onValueChane}
            >
              {getItems().map((item, index) => (
                <Picker.Item
                  label={item.label}
                  value={item.value}
                  key={index}
                />
              ))}
            </Picker>
          </ModalContent>
          <ModalFooter>
            <Button onPress={closePicker} label={'OK'} />
          </ModalFooter>
        </ModalContentContainer>
      </ModalContainer>
    </Modal>
  );
};

const ModalHeading = styled.Text`
  font-size: 24px;
  font-family: ${theme.fonts.heading};
  margin: 0 24px;
  justify-content: center;
  text-align: center;
  color: ${p => p.theme.text};
`;

const ModalContent = styled.Text`
  color: ${p => p.theme.text};
  justify-content: center;
  text-align: center;
`;

const ModalCloseButton = styled(CloseButton)`
  position: absolute;
  right: 16px;
  top: 18px;
  z-index: 3;
`;

const ModalContainer = styled.View`
  flex: 1;
  background: ${p => p.theme.modalBackground};
  justify-content: flex-end;
  align-items: center;
`;

const ModalContentContainer = styled.View`
  background: ${p => p.theme.background};
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  width: 100%;
  padding: 24px 24px 48px;
`;

const ModalFooter = styled.View`
  padding: 0 48px;
`;

export default PickerModal;
