import Dashboard from '../../pages/dashboard.tsx';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../../lib/context/auth-context.tsx';
import Login from '../../pages/login.tsx';
import { Users } from '@/pages/users.tsx';
import NewPassword from '@/pages/new-password.tsx';

const AppContainer = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {user ? (
          <>
            <Route path="/new-password" element={<NewPassword />} />
            <Route path="/users" element={<Users />} />
            <Route path="/" element={<Dashboard />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Login />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppContainer;
