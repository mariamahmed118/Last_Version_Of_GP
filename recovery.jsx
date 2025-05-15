import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getTopics, startDebate } from '../services/api';
import DebateCard from '../components/DebateCard';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      if (!user) {
        setError('Please log in to view topics.');
        setLoading(false);
        return;
      }
      try {
        const fetchedTopics = await getTopics(user.uid);
        setTopics(fetchedTopics);
        setLoading(false);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to load topics. Please try again.');
        setLoading(false);
      }
    };
    fetchTopics();
  }, [user]);

  const handleStartDebate = async (topic, position) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      const { debate_id } = await startDebate(user.uid, topic, position);
      navigate(`/debate/${debate_id}`);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to start debate. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <NavBar />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to DebateBrawl</h1>
        {loading ? (
          <p className="text-center">Loading topics...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <DebateCard
                key={index}
                topic={topic}
                onStartDebate={handleStartDebate}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
'../assets/models/old_fantasy-style_library/scene.gltf',
'../assets/models/kawaii__cute_flying_robot/scene.gltf',

C:\Users\Safeer\OneDrive\Desktop\Graduation Front-end\frontend\src\assets\models\obot_-_cute_robot_challenge





import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  const hideFooter = location.pathname === '/auth'; // إخفاء الـ Footer في صفحة Auth

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/debate/:debateId" element={<DebateRoom />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </main>
          {!hideFooter && <Footer />} {/* الـ Footer هيظهر في كل الصفحات ما عدا Auth */}
        </div>
      </Router>
    </AuthProvider>
  );
};