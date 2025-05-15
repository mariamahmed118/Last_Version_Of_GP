import React, { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';
import '../styles/animated-svg.css';

const AnimatedSVG = ({ svgPath, className, alt }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let animation = null;
    try {
      animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: svgPath, // Pass the imported JSON directly
      });

      return () => {
        if (animation) {
          animation.destroy();
        }
      };
    } catch (err) {
      setError('Failed to load animation');
      console.error('Lottie error:', err);
    }
  }, [svgPath]);

  return (
    <div
      className={className || 'animated-svg'}
      role="img"
      aria-label={alt || 'Animated SVG'}
    >
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};

export default AnimatedSVG;