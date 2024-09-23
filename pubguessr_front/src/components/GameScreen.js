import React, { useState, useEffect } from 'react';
import CustomMap from './CustomMap';

const GameScreen = ({}) => {
  const [currentImage, setCurrentImage] = useState(/* ... */);
  const [score, setScore] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [targetPosition, setTargetPosition] = useState(/* ... */);
  
  const imageDict = [
    { url: '/images/erangel_screen_1.jpg', position: { x: 700, y: 200 } },
    { url: '/images/bunker.jpg', position: { x: 500, y: 300 } },
    { url: '/images/Central-houses.jpg', position: { x: 700, y: 400 } },
    { url: '/images/Ferry-Pier-Town.jpg', position: { x: 300, y: 600 } },
    { url: '/images/garage.jpg', position: { x: 300, y: 600 } },
  ];

  useEffect(() => {
    setTargetPosition(imageDict[0]["position"]);
    setCurrentImage(imageDict[0]["url"])
  }, []);

  const handleScore = (newScore) => {
    setScore(newScore);
    setShowResult(true);
  };

  const handleNextImage = () => {
    setCurrentImage(imageDict[1]["url"]);
    setTargetPosition(imageDict[1]["position"]);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Grand screenshot */}
      <img 
        src={currentImage} 
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
          targetPosition={targetPosition}
          onScore={(newScore) => setScore(prevScore => prevScore + newScore)}
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
          Score: {score}
        </div>
      )}
    </div>
  );
};

export default GameScreen;