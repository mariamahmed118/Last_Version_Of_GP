import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  // Handle scroll effect and active section detection
  useEffect(() => {
    const handleScroll = () => {
      // Navbar background change on scroll
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Detect active section (on homepage only)
      if (location.pathname === '/') {
        const sections = ['home', 'how-it-works', 'testimonials']; 
        
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  // Navigate to auth page
  const handleGetStarted = () => {
    navigate('/auth');
    setMobileMenuOpen(false);
  };
  
  // Start a new debate
  const handleStartDebate = () => {
    navigate('/topics');
    setMobileMenuOpen(false);
  };
  
  // Scroll to section
  const scrollToSection = (sectionId) => {
    if (location.pathname === '/') {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to homepage with hash for section
      navigate(`/#${sectionId}`);
    }
    setMobileMenuOpen(false);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            DebateBrawl
          </Link>
          
          <div className="navbar-links">
            <span 
              onClick={() => scrollToSection('how-it-works')} 
              className={`navbar-link ${activeSection === 'how-it-works' ? 'active' : ''}`}
            >
              HOW IT WORKS
            </span>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className={`navbar-link ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                  DASHBOARD
                </Link>
                
                <span 
                  onClick={handleStartDebate} 
                  className="navbar-link"
                >
                  START DEBATE
                </span>
                
                <span 
                  onClick={handleLogout} 
                  className="navbar-link"
                >
                  SIGN OUT
                </span>
              </>
            ) : (
              <>
                <span 
                  onClick={handleGetStarted} 
                  className="navbar-link"
                >
                  GET STARTED
                </span>
                
                <Link to="/about" className="navbar-link">
                  ABOUT US
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="mobile-menu-button" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? '✕' : '☰'}
          </div>
        </div>
      </nav>
      
      {/* Mobile menu - only visible when opened */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <span 
          onClick={() => scrollToSection('how-it-works')} 
          className="navbar-link"
        >
          HOW IT WORKS
        </span>
        
        {user ? (
          <>
            <Link 
              to="/profile" 
              className="navbar-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              DASHBOARD
            </Link>
            
            <span 
              onClick={handleStartDebate} 
              className="navbar-link"
            >
              START DEBATE
            </span>
            
            <span 
              onClick={handleLogout} 
              className="navbar-link"
            >
              SIGN OUT
            </span>
          </>
        ) : (
          <>
            <span 
              onClick={handleGetStarted} 
              className="navbar-link"
            >
              GET STARTED
            </span>
            
            <Link 
              to="/about" 
              className="navbar-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              ABOUT US
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default NavBar;