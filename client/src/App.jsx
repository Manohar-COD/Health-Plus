import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Hydration from './pages/Hydration';
import Sleep from './pages/Sleep';
import Workouts from './pages/Workouts';
import Analytics from './pages/Analytics';
import AICoach from './pages/AICoach';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} className="pulse-primary"></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading Health Plus...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const MainLayout = ({ children }) => {
  return (
    <div style={styles.layoutContainer}>
      <Sidebar />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

      <Route path="/" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
      <Route path="/hydration" element={<PrivateRoute><MainLayout><Hydration /></MainLayout></PrivateRoute>} />
      <Route path="/sleep" element={<PrivateRoute><MainLayout><Sleep /></MainLayout></PrivateRoute>} />
      <Route path="/workouts" element={<PrivateRoute><MainLayout><Workouts /></MainLayout></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><MainLayout><Analytics /></MainLayout></PrivateRoute>} />
      <Route path="/ai-coach" element={<PrivateRoute><MainLayout><AICoach /></MainLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><MainLayout><Profile /></MainLayout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = {
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-primary)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTopColor: 'var(--primary)',
    animation: 'spin 1s linear infinite',
  },
  layoutContainer: {
    display: 'flex',
    minHeight: '100vh',
    padding: '20px',
  },
  mainContent: {
    marginLeft: '300px', // matches sidebar width + offset
    flexGrow: 1,
    padding: '0 20px',
  },
};

export default App;
