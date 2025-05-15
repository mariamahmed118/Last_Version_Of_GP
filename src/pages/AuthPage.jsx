import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, useAnimations } from '@react-three/drei';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { createUserDocument } from '../services/firestore';
import '../styles/auth.css';

// Enhanced Robot Model Component with Face-to-User Orientation
function CoolRobot(props) {
  const group = useRef();
  const { scene, animations } = useGLTF('/src/assets/models/cute_robot/scene.gltf');
  const { actions } = useAnimations(animations, group);

  // Robot animation states
  const [hovered, setHovered] = useState(false);
  const [lookingDown, setLookingDown] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Set initial orientation when component mounts
  useEffect(() => {
    if (group.current) {
      group.current.rotation.y = 360; // Adjust to face forward
    }
  }, []);

  // Start animations when component mounts
  useEffect(() => {
    if (animations.length > 0 && actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.play();
      }
    }

    setTimeout(() => {
      setLookingDown(true);
      setTimeout(() => {
        setLookingDown(false);
        setInitialLoad(false);
      }, 1500);
    }, 1000);

    const lookInterval = setInterval(() => {
      setLookingDown(true);
      setTimeout(() => setLookingDown(false), 1500);
    }, 10000);

    return () => clearInterval(lookInterval);
  }, [actions, animations]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (group.current) {
        if (lookingDown) {
          group.current.rotation.x = Math.min(group.current.rotation.x + 0.02, 0.4);
        } else {
          group.current.rotation.x = Math.max(group.current.rotation.x - 0.01, 0);
          group.current.rotation.y = 0;
        }

        const breathingIntensity = initialLoad ? 0.15 : 0.08;
        group.current.position.y = Math.sin(Date.now() * 0.001) * breathingIntensity;

        if (hovered) {
          group.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
        } else {
          group.current.rotation.z = 0;
        }
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hovered, lookingDown, initialLoad]);

  const handleHover = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handleUnhover = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group
      ref={group}
      {...props}
      onPointerOver={handleHover}
      onPointerOut={handleUnhover}
      scale={hovered ? [0.75, 0.75, 0.75] : [0.7, 0.7, 0.7]}
    >
      <primitive
        object={scene}
        position={[0, -1, 0]}
        rotation={[0, 300, 0]}
      />
    </group>
  );
}

// Improved loading fallback
function FallbackSphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#00a2ff" emissive="#00a2ff" emissiveIntensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#00a2ff" />
    </mesh>
  );
}

function AuthPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle viewport size for responsive adjustments
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await createUserDocument({
        uid: result.user.uid,
        email: result.user.email,
        username: result.user.email.split('@')[0],
        name: result.user.displayName || result.user.email.split('@')[0],
        createdAt: new Date(),
      });

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Animation interval for text effect
  const [animText, setAnimText] = useState("Your AI debate partner awaits...");

  useEffect(() => {
    const phrases = [
      "Your AI debate partner awaits...",
      "Ready to challenge your views?",
      "Join the debate now!",
      "Let's start debating together!",
    ];

    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phrases.length;
      setAnimText(phrases[currentIndex]);
    }, 3500);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <div className="auth-content side-by-side">
          {/* Left section with 3D model and sign in */}
          <div className="auth-left-side">
            <div className="auth-content-container">
              <div className="title-with-robot">
                <div className="auth-title">
                  <h2 style={{ fontSize: isMobile ? '1.7rem' : '2.5rem' }}>
                    DebateBrawl AI
                  </h2>
                </div>

                <div className="auth-3d-container">
                  <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                    }}
                  >
                    <color attach="background" args={['#050b15']} />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />
                    <pointLight position={[5, 5, -5]} intensity={1} color="#0088ff" />
                    <pointLight position={[-5, 5, -5]} intensity={1} color="#ff6600" />
                    <pointLight position={[0, -5, 5]} intensity={0.8} color="#00ffcc" />
                    <Suspense fallback={<FallbackSphere />}>
                      <CoolRobot />
                      <Environment preset="night" />
                    </Suspense>
                    <OrbitControls
                      enableZoom={false}
                      enablePan={false}
                      enableRotate={false}
                    />
                  </Canvas>
                </div>
              </div>

              <div className="auth-tagline">
                <p className="animated-text" style={{ fontSize: isMobile ? '1rem' : '1.4rem' }}>
                  {animText}
                </p>
              </div>

              <div className="auth-action-container">
                {error && <div className="error-message">{error}</div>}
                <div className="enhanced-google-auth">
                  <button
                    onClick={handleGoogleSignIn}
                    className="enhanced-auth-button"
                    disabled={loading}
                  >
                    Sign in with Google
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side with Why Join section */}
          <div className="auth-right-side">
            <div className="why-join-container">
              <h3>Why Join DebateBrawl?</h3>
              <ul>
                <li>Challenge your thinking with AI debates</li>
                <li>Improve your argument construction</li>
                <li>Track your debating progress</li>
                <li>Join the community of critical thinkers</li>
                <li>Practice debate skills in a safe environment</li>
                <li>Learn new perspectives on complex topics</li>
                <li>Receive feedback on your debate performance</li>
              </ul>
              <div className="auth-privacy-note">
                By signing in, you agree to our Terms of Service and Privacy Policy.
                Your data will only be used to improve your debating experience.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preload the 3D model
useGLTF.preload('/src/assets/models/cute_robot/scene.gltf');

export default AuthPage;