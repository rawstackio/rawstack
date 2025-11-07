import React from 'react';
import styled from 'styled-components/native';
import Screen from '../components/Template/Screen';

const Dashboard = () => {
  return (
    <Screen>
      <Wrapper behavior="padding">
        <Container>
          {/**
           * Your dashboard content goes here!
           *
           * This is great place for a flat list of recent items, or
           * a nice welcome message with some quick links to important
           * sections of the app!
           **/}
        </Container>
      </Wrapper>
    </Screen>
  );
};

const Container = styled.View`
  flex: 1;
`;

const Wrapper = styled.KeyboardAvoidingView`
  flex: 1;
`;

export default Dashboard;
