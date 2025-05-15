import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTopics, startDebate } from '../services/api';
import '../styles/topics.css';

const Topics = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(null);
  const [position, setPosition] = useState(null);
  const hasFetched = useRef(false);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      setTopics([]);
      setError(null);
      const userId = user?.id || localStorage.getItem('userId') || 'anonymous';
      console.log('Fetching topics with userId:', userId);

      const topicsData = await getTopics(userId);
      console.log('Topics received from API:', topicsData);

      if (!topicsData || !Array.isArray(topicsData) || topicsData.length === 0) {
        console.warn('No valid topics from API, using fallback.');
        setTopics([
          { id: 1, title: 'Should Social Media Companies be Responsible for Regulating Hate Speech?', category: 'Technology' },
          { id: 2, title: 'Universal Basic Income', category: 'Economics' },
          { id: 3, title: 'The Ethics of Gene Editing', category: 'Science' },
          { id: 4, title: 'Climate Change Mitigation', category: 'Environment' },
          { id: 5, title: 'Standardized Tests are Not a Fair Measure of Intelligence', category: 'Education' },
        ]);
      } else {
        const validatedTopics = topicsData.map((topic, index) => {
          return {
            id: topic.id || index + 1,
            title: topic.title || `Custom Topic ${index + 1}`,
            category: topic.category || 'General',
          };
        });
        setTopics(validatedTopics);
      }
      hasFetched.current = true;
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(`Failed to load topics. Error: ${err.message || 'Unknown error'}. Please check the API or network.`);
      setTopics([
        { id: 1, title: 'Should Social Media Companies be Responsible for Regulating Hate Speech?', category: 'Technology' },
        { id: 2, title: 'Universal Basic Income', category: 'Economics' },
        { id: 3, title: 'The Ethics of Gene Editing', category: 'Science' },
        { id: 4, title: 'Climate Change Mitigation', category: 'Environment' },
        { id: 5, title: 'Standardized Tests are Not a Fair Measure of Intelligence', category: 'Education' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    fetchTopics();
  }, []);

  const handleTopicSelect = (topic, index) => {
    setSelectedTopic(topic);
    setSelectedTopicIndex(index);
    console.log('Selected topic:', topic);
  };

  const handlePositionChange = (value) => {
    setPosition(value);
    console.log('Selected position:', value);
  };

  const handleStartDebate = async () => {
    if (!selectedTopic || !position) return;

    try {
      const userId = user?.id || localStorage.getItem('userId') || 'anonymous';
      console.log('Starting debate with:', {
        userId,
        topic: selectedTopic,
        position,
      });

      const result = await startDebate(userId, selectedTopic.title, position);
      console.log('Debate started:', result);

      navigate(`/debate/${result.debate_id}`);
    } catch (err) {
      console.error('Failed to start debate:', err);
      setError('Failed to start debate. Please try again.');
    }
  };

  return (
    <div className="debate-topics-container">
      <div className="debate-topics-header">
        <h1 className="debate-page-title">Start a New Debate</h1>
      </div>

      {isLoading ? (
        <div className="debate-loading-container">
          <div className="debate-loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="debate-error-message">{error}</div>
      ) : (
        <div className="debate-content-wrapper">
          <div className="debate-section">
            <div className="debate-section-header">
              <h2 className="debate-section-title">Choose Your Topic:</h2>
              <button
                onClick={() => {
                  hasFetched.current = false;
                  fetchTopics();
                }}
                className="debate-refresh-button"
                disabled={isLoading}
              >
                <span className="refresh-icon">⟳</span> Refresh Topics
              </button>
            </div>

            <div className="debate-topics-list">
              {topics.length > 0 ? (
                topics.map((topic, index) => (
                  <div
                    key={topic.id || index}
                    className={`debate-topic-card ${selectedTopicIndex === index ? 'selected' : ''}`}
                    onClick={() => handleTopicSelect(topic, index)}
                  >
                    <div className="debate-topic-content">
                      <div className="debate-radio-button">
                        <div className="debate-radio-outer">
                          {selectedTopicIndex === index && <div className="debate-radio-inner"></div>}
                        </div>
                      </div>
                      <span className="debate-topic-title">{topic.title || 'No Title'}</span>
                      {selectedTopicIndex === index && <div className="debate-selected-indicator"></div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="debate-no-topics">
                  No topics available. Please try again later.
                </div>
              )}
            </div>
          </div>

          <div className="debate-section">
            <div className="debate-section-header">
              <h2 className="debate-section-title">Choose Your Position:</h2>
            </div>

            <div className="debate-positions-list">
              <div
                className={`debate-position-card ${position === 'for' ? 'selected' : ''}`}
                onClick={() => handlePositionChange('for')}
              >
                <div className="debate-position-content">
                  <div className="debate-radio-button">
                    <div className="debate-radio-outer">
                      {position === 'for' && <div className="debate-radio-inner"></div>}
                    </div>
                  </div>
                  <span className="debate-position-label">For</span>
                  {position === 'for' && <div className="debate-check-indicator"></div>}
                </div>
              </div>

              <div
                className={`debate-position-card ${position === 'against' ? 'selected' : ''}`}
                onClick={() => handlePositionChange('against')}
              >
                <div className="debate-position-content">
                  <div className="debate-radio-button">
                    <div className="debate-radio-outer">
                      {position === 'against' && <div className="debate-radio-inner"></div>}
                    </div>
                  </div>
                  <span className="debate-position-label">Against</span>
                  {position === 'against' && <div className="debate-check-indicator"></div>}
                </div>
              </div>
            </div>
          </div>

          <div className="debate-button-container">
            <button
              onClick={handleStartDebate}
              disabled={!selectedTopic || !position}
              className={`debate-start-button ${selectedTopic && position ? 'active' : 'disabled'}`}
            >
              Start Debate with AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topics;