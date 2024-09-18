import React from 'react';
import GameScreen from './components/GameScreen';

const App = () => {
  const screenshotUrl = '/images/erangel_screen_1.jpg';
  const targetPosition = { x: 500, y: 300 }; // Exemple de position réelle

  return (
    <GameScreen 
      screenshotUrl={screenshotUrl}
      targetPosition={targetPosition}
    />
  );
};

export default App;