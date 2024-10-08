import React, { useState, useEffect } from 'react';
import { Pannellum } from "pannellum-react";
import CustomMap from './CustomMap';

const GameScreen = () => {
  const [globalScore, setGlobalScore] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [hfov, setHfov] = useState(50);
  const [vaov, setVaov] = useState(38);

  const panoramas = [
    { url: '/images/13.jpg', position: { x: 6294, y: 3973} },
    { url: '/images/14.jpg', position: { x: 3495, y: 3973} },
    { url: '/images/16.jpg', position: { x: 3577, y: 4082} },
    { url: '/images/17.jpg', position: { x: 3495, y: 4259} },
    { url: '/images/19.jpg', position: { x: 3836, y: 4464} },
    { url: '/images/20.jpg', position: { x: 4334, y: 4491} },
    { url: '/images/21.jpg', position: { x: 5051, y: 4437} },
    { url: '/images/22.jpg', position: { x: 5502, y: 4205} },
    { url: '/images/23.jpg', position: { x: 6280, y: 3979} },
    { url: '/images/24.jpg', position: { x: 6328, y: 3884} },
  ];

  useEffect(() => {
    const calculateFOV = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      const baseAspectRatio = 16 / 9;
      
      if (aspectRatio > baseAspectRatio) {
        // Écran plus large que 16:9
        setHfov(50 * (aspectRatio / baseAspectRatio));
        setVaov(38);
      } else {
        // Écran plus étroit que 16:9
        setHfov(50);
        setVaov(38 / (aspectRatio / baseAspectRatio));
      }
    };

    calculateFOV();
    window.addEventListener('resize', calculateFOV);
    
    return () => window.removeEventListener('resize', calculateFOV);
  }, []);

  const handleNextImage = () => {
    const nextIndex = (currentIndex + 1) % panoramas.length;
    setCurrentIndex(nextIndex);
    setKey(prevKey => prevKey + 1);
  };

  const handleScore = (newScore) => {
    setScore(newScore);
    setGlobalScore(globalScore + newScore);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Pannellum
        width="100%"
        height="100%"
        image={panoramas[currentIndex].url}
        avoidShowingBackground={true}
        type="equirectangular"
        hfov={hfov}
        vaov={vaov}
        minPitch={-19}
        maxPitch={19}
        pitch={0}
        autoLoad
        compass={false}
        showZoomCtrl={false}
        mouseZoom={false}
        hotspotDebug={false}
      >
        {/* Vous pouvez ajouter des hotspots ici si nécessaire */}
      </Pannellum>
     
      {/* Minimap dans le coin inférieur droit */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <CustomMap
          key={key}
          targetPosition={panoramas[currentIndex].position}
          onScore={handleScore}
          score={score}
          onNextImage={handleNextImage}
        />
      </div>
      {/* Affichage du score */}
      {showResult && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}>
          Score: {globalScore}
        </div>
      )}
    </div>
  );
};

export default GameScreen;