import React from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';
import CloseButton from '../Button/CloseButton';
import Button from '../Button/Button';
import { useApp } from '../../lib/context/AppContext';
import { theme } from '../../lib/theme';

export const AppModal = () => {
  const { modalConfig, setModalConfig } = useApp();

  const closeModal = () => {
    setModalConfig(undefined);
  };

  const renderConfirmButton = () => {
    return (
      <Button
        onPress={modalConfig?.confirmButton?.onPress ? modalConfig?.confirmButton?.onPress : closeModal}
        label={modalConfig?.confirmButton?.label || 'OK'}
        isBusy={modalConfig?.confirmButton?.isBusy}
      />
    );
  };

  const renderCancelButton = () => {
    if (!modalConfig?.cancelButton) {
      return null;
    }
    return (
      <CancelButton
        secondary={true}
        onPress={closeModal}
        label={modalConfig?.cancelButton?.label || 'CANCEL'}
        isBusy={modalConfig?.cancelButton?.isBusy}
      />
    );
  };

  return (
    <Modal visible={!!modalConfig} animationType={'fade'} transparent={true} presentationStyle="overFullScreen">
      <ModalContainer>
        <ModalContentContainer>
          <ModalCloseButton onPress={closeModal} size={24} />
          <ModalHeading>{modalConfig?.title || ''}</ModalHeading>
          <ModalContent>{modalConfig?.content || ''}</ModalContent>
          <ModalFooter doubleButtons={!!modalConfig?.cancelButton}>
            {renderConfirmButton()}
            {renderCancelButton()}
          </ModalFooter>
        </ModalContentContainer>
      </ModalContainer>
    </Modal>
  );
};

const ModalHeading = styled.Text`
  font-size: ${theme.fontSizes.heading}px;
  font-family: ${theme.fonts.heading};
  margin: 0 ${theme.layout.spacing}px;
  justify-content: center;
  text-align: center;
  color: ${p => p.theme.text};
`;

const ModalContent = styled.Text`
  text-align: center;
  margin: ${theme.layout.spacing / 3}px 0 ${theme.layout.spacing * 0.5}px;
  color: ${p => p.theme.text};
`;

const ModalCloseButton = styled(CloseButton)`
  position: absolute;
  right: ${theme.layout.spacing * 0.67}px;
  top: ${theme.layout.spacing * 0.7}px;
  z-index: 3;
`;

const ModalContainer = styled.View`
  flex: 1;
  background: ${p => p.theme.modalBackground};
  justify-content: center;
  align-items: center;
`;

const ModalContentContainer = styled.View`
  background: ${p => p.theme.background};
  width: 80%;
  padding: ${theme.layout.spacing}px;
  border-radius: 1px;
`;

const ModalFooter = styled.View<{ doubleButtons?: boolean }>`
  padding: 0 ${theme.layout.spacing}px;
  flex-direction: ${p => (p.doubleButtons ? 'row' : 'column')};
`;

const CancelButton = styled(Button)`
  margin-left: ${theme.layout.spacing / 3}px;
`;

export default AppModal;
