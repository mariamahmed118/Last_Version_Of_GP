import React, { useState, useEffect, useContext, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTopics, startDebate } from '../services/api';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Torus } from '@react-three/drei';
import '../styles/topics.css';

// Hook for detecting screen size - Reused from Home.jsx
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}

// Hover Ring component - Enhanced to be more prominent
function HoverRings() {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  
  useFrame((state, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 0.4;
    }
  });
  
  // Positioned rings below the podium
  return (
    <group position={[0, -3, 0]}>
      {/* Outer ring - Using theme gradient color with increased brightness */}
      <Torus 
        ref={ring1Ref}
        args={[3.2, 0.08, 16, 32]} 
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="#00e5ff" 
          emissive="#00e5ff" 
          emissiveIntensity={1.5} 
          transparent={true}
          opacity={0.8}
        />
      </Torus>
      
      {/* Middle ring - Using theme gradient color */}
      <Torus 
        ref={ring2Ref}
        args={[2.6, 0.07, 16, 32]} 
        rotation={[Math.PI / 2, 0, Math.PI / 4]}
      >
        <meshStandardMaterial 
          color="#0066cc" 
          emissive="#0066cc" 
          emissiveIntensity={1.5} 
          transparent={true}
          opacity={0.8}
        />
      </Torus>
      
      {/* Inner ring - Using theme gradient color */}
      <Torus 
        ref={ring3Ref}
        args={[2.0, 0.06, 16, 32]} 
        rotation={[Math.PI / 2, 0, Math.PI / 6]}
      >
        <meshStandardMaterial 
          color="#00e5ff" 
          emissive="#00e5ff" 
          emissiveIntensity={1.5} 
          transparent={true}
          opacity={0.8}
        />
      </Torus>
    </group>
  );
}

// DebatePodium component - Increased scale and improved animation
function DebatePodium() {
  const { scene } = useGLTF('/src/assets/models/debate_podium/scene.gltf');
  const groupRef = useRef();
  const { width } = useWindowSize();
  
  // Increased scale for more prominence
  const getScale = () => {
    if (width < 480) return [1.8, 1.8, 1.8];
    if (width < 768) return [2.2, 2.2, 2.2];
    if (width < 992) return [2.5, 2.5, 2.5];
    return [3.0, 3.0, 3.0];
  };
  
  // Adjusted positions to place podium more centrally
  const getPosition = () => {
    if (width < 480) return [0, -3, 0];
    if (width < 768) return [0, -3, 0];
    if (width < 992) return [0, -3, 0];
    return [0, -3, 0];
  };
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timeRef = useRef(0);
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      timeRef.current += delta;
      // Simple hovering animation for the podium
      groupRef.current.position.y += Math.sin(timeRef.current * 0.8) * 0.004;
      // Gentle rotation for podium highlighting
      groupRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={getScale()} 
        position={getPosition()}
      />
      <HoverRings />
    </group>
  );
}

function FallbackPodium() {
  return (
    <group>
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial color="#0066cc" emissive="#0066cc" emissiveIntensity={0.3} />
      </mesh>
      <Torus 
        args={[2.0, 0.06, 16, 32]} 
        position={[0, -3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.8} />
      </Torus>
    </group>
  );
}

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
  const { width } = useWindowSize();
  const showPodium = width > 480;

  // Adjusted camera parameters for better podium visibility
  const getCameraParams = () => {
    if (width < 480) return { fov: 75, position: [0, 0, 8] };
    if (width < 768) return { fov: 70, position: [0, 0, 8.5] };
    if (width < 992) return { fov: 65, position: [0, 0, 9] };
    return { fov: 60, position: [0, 0, 10] };
  };

  const fetchTopics = async () => {
    // Prevent multiple fetches if already done
    if (hasFetched.current) return;
    
    try {
      setIsLoading(true);
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
      // Mark as fetched to prevent duplicate calls
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

  const handleRefreshTopics = () => {
    // Reset the fetched state to allow refetching
    hasFetched.current = false;
    fetchTopics();
  };

  return (
    <div className="debate-topics-container">
      <div className="debate-topics-header">
        <h1 className="debate-page-title">Start a New Debate</h1>
      </div>
      
      {/* Podium Container - Enhanced size and centered */}
      {showPodium && (
        <div className="debate-podium-container">
          <Canvas
            style={{ 
              position: 'fixed', 
              top: '0', 
              left: '0', 
              width: '100%', 
              height: '100%', 
              zIndex: '1'
            }}
            camera={getCameraParams()}
            onCreated={(state) => {
              state.gl.setClearColor('#050f19');
              state.gl.setClearAlpha(0);
              state.gl.toneMappingExposure = 1.8;
            }}
          >
            <ambientLight intensity={2.2} />
            <directionalLight position={[5, 5, 5]} intensity={2.5} />
            <pointLight position={[0, 3, 0]} intensity={1.8} />
            {/* Enhanced lighting with theme colors */}
            <pointLight position={[-5, 0, 5]} intensity={2} color="#00e5ff" />
            <pointLight position={[5, 0, 5]} intensity={2} color="#0066cc" />
            <Environment preset="night" />
            <Suspense fallback={<FallbackPodium />}>
              <DebatePodium />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Content Container - Added z-index to appear above the 3D model */}
      <div className="debate-content-wrapper" style={{ position: 'relative', zIndex: '2' }}>
        {isLoading ? (
          <div className="debate-loading-container">
            <div className="debate-loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="debate-error-message">{error}</div>
        ) : (
          <>
            <div className="debate-section">
              <div className="debate-section-header">
                <h2 className="debate-section-title">Choose Your Topic:</h2>
                <button
                  onClick={handleRefreshTopics}
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
                className={`debate-start-button home-style ${selectedTopic && position ? 'active' : 'disabled'}`}
              >
                Start Debate with AI
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Preload the model to improve performance
useGLTF.preload('/src/assets/models/  /scene.gltf');

export default Topics;