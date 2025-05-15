import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import DebateRoom from './pages/DebateRoom';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import Topics from './pages/Topics'; // Import Topics component
import AuthProvider from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

// Create a layout component that conditionally renders the footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <>
      <NavBar />
      <main className="main-content">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            <Route path="/debate/:debateId" element={
              <Layout>
                <DebateRoom />
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <Profile />
              </Layout>
            } />
            <Route path="/auth" element={
              <Layout>
                <AuthPage />
              </Layout>
            } />
            {/* Add Topics route */}
            <Route path="/topics" element={
              <Layout>
                <Topics />
              </Layout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;