import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const PrivateRoute = ({ children }) => {
  const token = useStore((state) => state.token);
  return token ? children : <Navigate to="/login" />;
};

import { authService } from './services/api';

import { Toaster } from 'react-hot-toast';

function App() {
  const token = useStore(state => state.token);
  const setUser = useStore(state => state.setUser);
  const logout = useStore(state => state.logout);

  React.useEffect(() => {
    if (token) {
      authService.fetchMe()
        .then(res => setUser(res.data, token))
        .catch(() => logout());
    }
  }, [token]);

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard/*" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
