import React, { useState, useEffect, useContext, Suspense, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import '../styles/home.css';

// Hook للتحقق من حجم الشاشة - Screen size detection hook
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

function CuteRobot() {
  const { scene } = useGLTF('/src/assets/models/kawaii__cute_flying_robot/scene.gltf');
  const groupRef = useRef();
  const { width } = useWindowSize();
  
  const getScale = () => {
    if (width < 480) return [3, 3, 3];
    if (width < 768) return [4, 4, 4];
    if (width < 992) return [4.5, 4.5, 4.5];
    return [5, 5, 5];
  };
  
  const getPosition = () => {
    if (width < 480) return [-1, -0.5, 0];
    if (width < 768) return [-1.5, -0.7, 0];
    if (width < 992) return [-1.8, -0.8, 0];
    return [-2, -1, 0];
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
      groupRef.current.position.y = Math.sin(timeRef.current * 0.8) * 0.15;
      groupRef.current.rotation.y += (mousePosition.x * 0.3 - groupRef.current.rotation.y) * 0.02;
      groupRef.current.rotation.x += (-mousePosition.y * 0.15 - groupRef.current.rotation.x) * 0.02;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive 
        object={scene} 
        scale={getScale()} 
        position={getPosition()} 
      />
    </group>
  );
}

function FallbackRobot() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#00ccee" emissive="#00ccee" emissiveIntensity={0.3} />
    </mesh>
  );
}

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { width } = useWindowSize();
  const containerRef = useRef(null);
  const showRobot = width > 320;
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  
  const getCameraParams = () => {
    if (width < 480) return { fov: 75, position: [0, 0, 8] };
    if (width < 768) return { fov: 70, position: [0, 1, 10] };
    if (width < 992) return { fov: 65, position: [0, 1.5, 11] };
    return { fov: 60, position: [0, 2, 12] };
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = window.innerHeight; // After scrolling one viewport height

      if (scrollPosition > threshold) {
        setIsHeroVisible(false);
      } else {
        setIsHeroVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartDebate = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      navigate('/topics');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Failed to navigate to topics. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      <main className="flex-grow">
        <section className="hero-section">
          <div className={`fixed-viewport ${isHeroVisible ? '' : 'hidden'}`} ref={containerRef}>
            <div className="bg-gradient"></div>
            <div className="text-content">
              <div className="text-content-inner">
                <p className="small-header">Inspired by IBM</p>
                <h2 className="brand-logo">
                  D<span>e</span>bateB<span>r</span>awl
                </h2>
                <h1 className="main-heading">
                  DEBATE-DRIVEN<br/> METAVERSE
                </h1>
                <p className="tagline">
                  Join Millions in Thought-Provoking Debates Without Barriers
                </p>
                <p className="description">
                  Face our AI in real debates. Sharpen your mind, expand your vision, and rise as a true debater.
                </p>
                <button 
                  onClick={handleStartDebate}
                  className="try-now-btn"
                >
                  {user ? "Start a New AI Debate" : "Get Started"}
                </button>
                {error && <p className="error-message">{error}</p>}
              </div>
            </div>
            {showRobot && (
              <div className="robot-container">
                <Canvas
                  style={{ width: '100%', height: '100%' }}
                  camera={getCameraParams()}
                  onCreated={(state) => {
                    state.gl.setClearColor('#050f19');
                    state.gl.setClearAlpha(0);
                    state.gl.toneMappingExposure = width < 768 ? 1.7 : 1.5;
                  }}
                >
                  <ambientLight intensity={width < 768 ? 2 : 1.8} />
                  <directionalLight position={[5, 5, 5]} intensity={width < 768 ? 2 : 1.8} />
                  <pointLight position={[0, 3, 0]} intensity={width < 768 ? 2 : 1.8} />
                  <pointLight position={[-5, 0, 5]} intensity={1.2} color="#0ce" />
                  <pointLight position={[5, 0, 5]} intensity={1.2} color="#ff9900" />
                  <Environment preset="night" />
                  <Suspense fallback={<FallbackRobot />}>
                    <CuteRobot />
                  </Suspense>
                </Canvas>
              </div>
            )}
          </div>
          <div style={{ height: '100vh' }}></div>
        </section>
        
        {/* Updated "Why Choose Us" section with 4 features based on image 3 */}
        <section id="why-choose-us" className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-blue-400">Why Choose DebateBrawl?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1: Advanced AI Opponent */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col items-center mb-4">
                  <img 
                    src="/src/assets/images/undraw_artificial_intelligence_re_enpp.svg" 
                    alt="Advanced AI Opponent" 
                    className="h-32 w-32 mb-4"
                  />
                  <h3 className="text-xl font-semibold text-blue-400">Advanced AI Opponent</h3>
                </div>
                <p className="text-gray-300 text-center">
                  Challenge yourself against a sophisticated AI debater that adapts to your style and provides meaningful responses to your arguments.
                </p>
              </div>
              
              {/* Feature 2: Real-time Feedback */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col items-center mb-4">
                  <img 
                    src="/src/assets/images/undraw_candidate_ubww.svg" 
                    alt="Real-time Feedback" 
                    className="h-32 w-32 mb-4"
                  />
                  <h3 className="text-xl font-semibold text-blue-400">Real-time Feedback</h3>
                </div>
                <p className="text-gray-300 text-center">
                  Receive instant feedback on your arguments and debate techniques to improve your persuasion skills.
                </p>
              </div>
              
              {/* Feature 3: Diverse Topics */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col items-center mb-4">
                  <img 
                    src="/src/assets/images/undraw_firmware_re_fgdy.svg" 
                    alt="Diverse Topics" 
                    className="h-32 w-32 mb-4"
                  />
                  <h3 className="text-xl font-semibold text-blue-400">Diverse Topics</h3>
                </div>
                <p className="text-gray-300 text-center">
                  Explore a wide range of debate topics to broaden your knowledge and debating skills across various domains.
                </p>
              </div>
              
              {/* Feature 4: Skill Development */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col items-center mb-4">
                  <img 
                    src="/src/assets/images/undraw_robotics_kep0.svg" 
                    alt="Skill Development" 
                    className="h-32 w-32 mb-4"
                  />
                  <h3 className="text-xl font-semibold text-blue-400">Skill Development</h3>
                </div>
                <p className="text-gray-300 text-center">
                  Track your progress and improve your critical thinking and persuasion skills over time with our comprehensive analytics.
                </p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <button 
                onClick={handleStartDebate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium transition duration-300"
              >
                {user ? "Start Your Debate Now" : "Sign Up & Get Started"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

useGLTF.preload('/src/assets/models/kawaii__cute_flying_robot/scene.gltf');

export default Home;