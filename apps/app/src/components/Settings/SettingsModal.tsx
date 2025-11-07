import React from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';
import CloseButton from '../Button/CloseButton';
import SettingsPasswordForm from './SettingsPasswordForm';
import SettingsEmailForm from './SettingsEmailForm';

interface Props {
  type?: 'password' | 'email';
  onClose: () => void;
}

export const SettingsModal = ({ onClose, type }: Props) => {
  return (
    <Modal
      visible={!!type}
      animationType={'fade'}
      transparent={true}
      presentationStyle="overFullScreen"
    >
      <ModalContainer>
        <ModalContentContainer>
          <ModalCloseButton onPress={onClose} size={24} />
          <ModalHeading>
            {type === 'email' ? 'Update Email' : 'Update Password'}
          </ModalHeading>
          <ModalContent>
            {type === 'email' ? (
              <SettingsEmailForm onUpdated={onClose} />
            ) : (
              <SettingsPasswordForm onUpdated={onClose} />
            )}
          </ModalContent>
        </ModalContentContainer>
      </ModalContainer>
    </Modal>
  );
};

const ModalHeading = styled.Text`
  color: ${p => p.theme.text};
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const ModalContent = styled.View`
  margin-top: 18px;
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
  padding: 24px 24px 48px;
`;

export default SettingsModal;
