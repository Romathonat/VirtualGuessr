import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [score, setScore] = useState(0);
  const [userPosition, setUserPosition] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapSize, setMapSize] = useState(400);
  const [isExpanded, setIsExpanded] = useState(false);
  const [globalScore, setGlobalScore] = useState(0);
  const [showResult, setShowResult] = useState(true);
  const [isPortrait, setIsPortrait] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <GameContext.Provider value={{
      score,
      setScore,
      userPosition,
      setUserPosition,
      targetPosition,
      setTargetPosition,
      isFullScreen,
      setIsFullScreen,
      isPortrait,
      setIsPortrait,
      currentIndex,
      setCurrentIndex,
      mapSize,
      setMapSize,
      isExpanded,
      setIsExpanded,
      globalScore,
      setGlobalScore,
      showResult,
      setShowResult,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
