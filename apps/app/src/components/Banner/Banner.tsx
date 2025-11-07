import { Animated } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import styled from 'styled-components/native';
import TypedText from './TypedText';
import { useApp } from '../../lib/context/AppContext';

const Banner = () => {
  const { getActiveTheme } = useApp();
  const [bgAnimation] = useState(new Animated.Value(0));
  const [transitionIndex, setTransitionIndex] = useState(0);

  const items = ['Your product', 'Your dream', 'Your stack', 'RawStack'];

  const colors =
    getActiveTheme() === 'dark'
      ? ['#7f003a', '#3a007f', '#9f4600', '#222000', '#7f003a']
      : ['#eeacc5', '#d4b9ff', '#fde0c9', '#eeefff', '#eeacc5'];

  useEffect(() => {
    return () => {
      bgAnimation.stopAnimation();
    };
  }, [bgAnimation]);

  useLayoutEffect(() => {
    Animated.timing(bgAnimation, {
      toValue: transitionIndex,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (transitionIndex === items.length) {
        bgAnimation.setValue(0);
      }
    });
  }, [bgAnimation, items.length, transitionIndex]);

  return (
    <Wrapper
      style={{
        backgroundColor: bgAnimation.interpolate({
          inputRange: [0, 1, 2, 3, 4],
          outputRange: colors,
        }),
      }}
    >
      <BannerTextRow>
        <BannerText
          deletingSpeed={30}
          pause={2400}
          typingSpeed={100}
          items={items}
          typingStarted={(index: number) => {
            if (index === 0) {
              setTransitionIndex(items.length);
            } else {
              setTransitionIndex(index);
            }
          }}
        />
        <Dot />
      </BannerTextRow>
    </Wrapper>
  );
};

const Wrapper = styled(Animated.View)`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const Dot = styled.View`
  margin-left: 4px;
  width: 23px;
  height: 23px;
  background: ${p => p.theme.text};
  border-radius: 24px;
`;

const BannerTextRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BannerText = styled(TypedText)`
  font-size: 28px;
  color: ${p => p.theme.text};
  letter-spacing: -1px;
`;

export default Banner;
