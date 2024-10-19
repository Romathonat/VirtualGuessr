import React from 'react';
import GameScreen from './components/GameScreen';
import { GameProvider } from './contexts/GameContext';

const App = () => {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
};

export default App;
