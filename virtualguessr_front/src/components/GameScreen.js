import React, { useState, useEffect } from 'react';
import CustomMap from './CustomMap';

const GameScreen = ({}) => {
  const [globalScore, setGlobalScore] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0); 

  const imageDict = [
    { url: '/images/erangel_screen_1.jpg', position: { x: 700, y: 200 } },
    { url: '/images/bunker.jpg', position: { x: 500, y: 300 } },
    { url: '/images/Central-houses.jpg', position: { x: 700, y: 400 } },
    { url: '/images/Ferry-Pier-Town.jpg', position: { x: 300, y: 600 } },
    { url: '/images/garage.jpg', position: { x: 300, y: 600 } },
  ];

  const handleNextImage = () => {
    const nextIndex = (currentIndex + 1) % imageDict.length;
    setCurrentIndex(nextIndex);
    setKey(prevKey => prevKey + 1);
  };

  const handleScore = (newScore) => {
    setScore(newScore);
    setGlobalScore(globalScore + newScore);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Grand screenshot */}
      <img 
        src={imageDict[currentIndex].url} 
        alt="Game Screenshot" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      
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
          targetPosition={imageDict[currentIndex].position}
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