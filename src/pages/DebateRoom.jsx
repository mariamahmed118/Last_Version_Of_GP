import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getDebateState, submitArgument } from '../services/api';
import FeedbackBox from '../components/FeedbackBox';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useParams, useNavigate } from 'react-router-dom';

const DebateRoom = () => {
  const { debateId } = useParams();
  const { user } = useContext(AuthContext);
  const [debateState, setDebateState] = useState(null);
  const [argument, setArgument] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDebateState = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      try {
        const state = await getDebateState(debateId);
        setDebateState(state);
        setLoading(false);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to load debate. Please try again.');
        setLoading(false);
      }
    };
    fetchDebateState();
  }, [user, debateId, navigate]);

  const handleSubmitArgument = async (e) => {
    e.preventDefault();
    if (!argument.trim()) return;
    try {
      const response = await submitArgument(debateId, user.uid, argument);
      setDebateState({
        ...debateState,
        current_round: response.current_round,
        scores: {
          user: debateState.scores.user + response.score,
          ai: debateState.scores.ai + response.ai_score,
        },
        arguments: {
          ...debateState.arguments,
          [`round_${response.current_round - 1}`]: {
            user: argument,
            ai: response.ai_argument,
          },
        },
        llm_suggestions: response.llm_suggestions,
        evaluation_feedback: response.evaluation_feedback,
      });
      setArgument('');
      if (response.current_round > 5) {
        navigate(`/profile`);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to submit argument. Please try again.');
    }
  };

  if (loading) return <p className="text-center">Loading debate...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!debateState) return <p className="text-center">No debate data available.</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <NavBar />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{debateState.topic}</h1>
        <p className="mb-4">
          Round {debateState.current_round} / {5} | Your Position: {debateState.user_position}
        </p>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Scores</h2>
          <p>You: {debateState.scores.user.toFixed(2)} | AI: {debateState.scores.ai.toFixed(2)}</p>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Arguments</h2>
          {Object.keys(debateState.arguments).map((roundKey) => (
            <div key={roundKey} className="mb-4 p-4 bg-white rounded shadow">
              <p className="font-bold">{roundKey.replace('_', ' ')}</p>
              <p><strong>You:</strong> {debateState.arguments[roundKey].user}</p>
              <p><strong>AI:</strong> {debateState.arguments[roundKey].ai}</p>
            </div>
          ))}
        </div>
        {debateState.current_round <= 5 && (
          <form onSubmit={handleSubmitArgument} className="mb-6">
            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Enter your argument..."
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit Argument
            </button>
          </form>
        )}
        <FeedbackBox
          feedback={debateState.evaluation_feedback}
          suggestions={debateState.llm_suggestions}
        />
      </main>
      <Footer />
    </div>
  );
};

export default DebateRoom;