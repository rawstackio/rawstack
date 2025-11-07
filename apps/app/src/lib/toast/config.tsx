import React from 'react';
import { Dimensions } from 'react-native';
import { BaseToastProps, BaseToast } from 'react-native-toast-message';
import styled from 'styled-components/native';

const width = Dimensions.get('window').width;

const toastConfig = {
  success: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <Wrapper {...props} contentContainerStyle={{ paddingHorizontal: 12 }} />
  ),
};

const Wrapper = styled(BaseToast)`
  border-left-width: 0;
  border-radius: 2px;
  margin-top: 24px;
  width: ${width - 48}px;
`;

export default toastConfig;
