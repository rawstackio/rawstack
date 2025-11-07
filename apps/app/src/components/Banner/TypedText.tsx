import React, { useState, useEffect } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface Props {
  items: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
  swapPause?: number;
  typingStarted?: (index: number, item: string) => void;
  pauseStarted?: (index: number, item: string) => void;
  deletingStarted?: (index: number, item: string) => void;
  itemLoaded?: (index: number, item: string) => void;
  style?: StyleProp<TextStyle>;
}

const TypedText = ({
  items,
  typingSpeed,
  deletingSpeed,
  pause,
  swapPause,
  itemLoaded,
  typingStarted,
  deletingStarted,
  pauseStarted,
  style,
}: Props) => {
  typingSpeed = typingSpeed || 150;
  deletingSpeed = deletingSpeed || 50;
  pause = pause || 3300;
  swapPause = swapPause || 400;

  const [delay, setDelay] = useState(typingSpeed);
  const [action, setAction] = useState<'type' | 'delete'>('type');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const loadNextWord = (index: number) => {
    if (itemLoaded) {
      itemLoaded(index, items[index]);
    }
    setCurrentWordIndex(index);
  };

  const startDeletion = () => {
    if (deletingStarted) {
      deletingStarted(currentWordIndex, items[currentWordIndex]);
    }
    setDelay(deletingSpeed as number);
    setAction('delete');
  };

  const startTyping = (index: number) => {
    setDelay(typingSpeed as number);
    setAction('type');

    if (typingStarted) {
      typingStarted(index, items[index]);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentLetterIndex === items[currentWordIndex].length) {
        // this is the end of the string typing
        clearTimeout(timeout);

        // Paused!!
        if (pauseStarted) {
          pauseStarted(currentWordIndex, items[currentWordIndex]);
        }
        setTimeout(() => {
          startDeletion();

          const nextIndex = items[currentWordIndex].length - 1;
          setCurrentLetterIndex(nextIndex);
        }, pause);
      } else if (currentLetterIndex === 0 && action === 'delete') {
        // this is where we should swap to a new word.
        clearTimeout(timeout);

        const nextWordIndex = (currentWordIndex + 1) % items.length;
        loadNextWord(nextWordIndex);

        setTimeout(() => {
          // typing started
          startTyping(nextWordIndex);

          const nextIndex = 1;
          setCurrentLetterIndex(nextIndex);
        }, swapPause);
      } else if (
        currentLetterIndex < items[currentWordIndex].length &&
        action === 'type'
      ) {
        const nextIndex = currentLetterIndex + 1;
        setCurrentLetterIndex(nextIndex);
      } else {
        const nextIndex = currentLetterIndex - 1;
        setCurrentLetterIndex(nextIndex);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentLetterIndex]);

  return (
    <Text style={style}>
      {items[currentWordIndex].substring(0, currentLetterIndex)}
    </Text>
  );
};

export default TypedText;
