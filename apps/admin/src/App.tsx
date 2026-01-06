import { Toaster } from 'sonner';
import AppContainer from './components/layout/app-container.tsx';
import AuthProvider from './lib/context/auth-context.tsx';
import AppProvider from './lib/context/app-context.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <AppContainer />
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
