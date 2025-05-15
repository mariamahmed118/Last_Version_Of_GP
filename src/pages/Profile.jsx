import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserStats, getUserDebateHistory } from '../services/api';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      try {
        const userStats = await getUserStats(user.uid);
        const debateHistory = await getUserDebateHistory(user.uid);
        setStats(userStats);
        setHistory(debateHistory);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const filterDebates = (filter) => {
    setActiveFilter(filter);
    // Implementation for filtering debates would go here
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="stats-card loading-pulse">
            <h2>Loading profile data...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="stats-card">
            <h2 style={{ color: '#f87171' }}>{error}</h2>
            <button 
              className="profile-action-button"
              onClick={() => window.location.reload()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const winRate = stats ? Math.round((stats.wins / (stats.totalDebates || 1)) * 100) : 0;

  return (
    <div className="profile-container">
      <NavBar />
      <div className="profile-content">
        <div className="profile-header">
          <h1>Debater Profile</h1>
          <button className="profile-action-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Stats cards section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="stat-card-title">Total Debates</div>
            <div className="stat-card-value">{stats?.totalDebates || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="stat-card-title">Remaining Free Debates</div>
            <div className="stat-card-value">{stats?.remainingFreeDebates || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div className="stat-card-title">Wins</div>
            <div className="stat-card-value">{stats?.wins || 0}</div>
            <div className="stat-trend stat-trend-positive">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>Winning streak: {stats?.currentStreak || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <div className="stat-card-title">Losses</div>
            <div className="stat-card-value">{stats?.losses || 0}</div>
          </div>
        </div>

        {/* User stats section */}
        <div className="user-stats-section">
          <div className="stats-card">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Performance Metrics
            </h2>
            <div className="stats-grid-inner">
              <div className="stat-item">
                <div className="stat-label">Average Score</div>
                <div className="stat-value">{stats?.averageScore || '0.0'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Highest Score</div>
                <div className="stat-value">{stats?.highestScore || '0.0'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Draws</div>
                <div className="stat-value">{stats?.draws || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Debate Time</div>
                <div className="stat-value">{stats?.totalDebateTime || '0h 0m'}</div>
              </div>
            </div>
            <div className="stats-chart">
              <div className="chart-placeholder"></div>
            </div>
          </div>

          <div className="stats-card">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              Win Rate
            </h2>
            <div className="win-rate-card">
              <div className="win-rate-circle">
                <div className="win-rate-inner">
                  <div className="win-rate-value">{winRate}%</div>
                  <div className="win-rate-label">Win Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debate history section */}
        <div className="debate-history-section">
          <div className="debate-history-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
              Debate History
            </h2>
            <div className="debate-history-filter">
              <button 
                className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => filterDebates('all')}
              >
                All
              </button>
              <button 
                className={`filter-button ${activeFilter === 'wins' ? 'active' : ''}`}
                onClick={() => filterDebates('wins')}
              >
                Wins
              </button>
              <button 
                className={`filter-button ${activeFilter === 'losses' ? 'active' : ''}`}
                onClick={() => filterDebates('losses')}
              >
                Losses
              </button>
            </div>
          </div>

          {history.length > 0 ? (
            <div className="debates-grid">
              {history.map((debate) => (
                <div key={debate.debateId} className="debate-card">
                  <div className="debate-card-topic">{debate.topic}</div>
                  <div className="debate-card-details">
                    <div className="debate-card-detail">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">{debate.date}</span>
                    </div>
                    <div className="debate-card-detail">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{debate.duration || '5 min'}</span>
                    </div>
                    <div className="debate-card-detail">
                      <span className="detail-label">Position</span>
                      <span className="detail-value">{debate.position || 'For'}</span>
                    </div>
                    <div className="debate-card-detail">
                      <span className="detail-label">Mode</span>
                      <span className="detail-value">{debate.mode || 'Standard'}</span>
                    </div>
                  </div>
                  <div className="debate-card-result">
                    <div className={`result-badge ${
                      debate.result === 'Win' ? 'result-win' : 
                      debate.result === 'Loss' ? 'result-loss' : 'result-draw'
                    }`}>
                      {debate.result}
                    </div>
                    <div className="scores-display">
                      <div className="score-item">
                        <div className="score-value">{debate.userScore}</div>
                        <div className="score-label">You</div>
                      </div>
                      <div className="vs">vs</div>
                      <div className="score-item">
                        <div className="score-value">{debate.aiScore}</div>
                        <div className="score-label">AI</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="empty-state-text">You haven't participated in any debates yet.</div>
              <button className="empty-state-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Start Your First Debate
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;