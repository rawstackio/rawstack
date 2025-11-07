import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNBootSplash from 'react-native-bootsplash';
import 'react-native-gesture-handler';
import UiProvider from './src/lib/context/AppContext';
import AppContainer from './src/components/Template/AppContainer';
import { initDate } from './src/lib/boot/initDate';
import AuthProvider from './src/lib/context/AuthContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const init = async () => {
      initDate();
    };
    init().finally(() => RNBootSplash.hide({ fade: true }));
  }, []);

  return (
    <UiProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AuthProvider>
          <AppContainer />
        </AuthProvider>
      </SafeAreaProvider>
    </UiProvider>
  );
}

export default App;
