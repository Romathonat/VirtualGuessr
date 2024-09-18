import React, { useState } from 'react';
import CustomMap from './CustomMap';

const GameScreen = ({ screenshotUrl, targetPosition }) => {
  const [score, setScore] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleScore = (newScore) => {
    setScore(newScore);
    setShowResult(true);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Grand screenshot */}
      <img 
        src={screenshotUrl} 
        alt="Game Screenshot" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      
      {/* Minimap dans le coin inférieur droit */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '800px',
        height: 'auto',
        border: '2px solid white',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <CustomMap 
          targetPosition={targetPosition}
          onScore={handleScore}
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