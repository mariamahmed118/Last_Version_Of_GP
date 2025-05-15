import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserStats, getUserDebateHistory } from '../services/api';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  if (loading) return <p className="text-center">Loading profile...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <NavBar />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {stats && (
          <div className="mb-6 p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold">Statistics</h2>
            <p>Total Debates: {stats.totalDebates}</p>
            <p>Remaining Free Debates: {stats.remainingFreeDebates}</p>
            <p>Wins: {stats.wins}</p>
            <p>Losses: {stats.losses}</p>
            <p>Draws: {stats.draws}</p>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold mb-2">Debate History</h2>
          {history.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {history.map((debate) => (
                <div key={debate.debateId} className="p-4 bg-white rounded shadow">
                  <p><strong>Topic:</strong> {debate.topic}</p>
                  <p><strong>Date:</strong> {debate.date}</p>
                  <p><strong>Result:</strong> {debate.result}</p>
                  <p><strong>Your Score:</strong> {debate.userScore}</p>
                  <p><strong>AI Score:</strong> {debate.aiScore}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No debate history available.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;