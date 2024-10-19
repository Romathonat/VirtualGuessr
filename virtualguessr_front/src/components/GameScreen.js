import React, { useState, useEffect, useRef, useMemo } from 'react';
import PortraitMap from './PortraitMap';
import LandscapeMinimap from './LandscapeMinimap';
import NewsletterIcon from './NewsletterIcon';
import PanoramaViewer from './PanoramaViewer';
import ScoreDisplay from './ScoreDisplay';
import useGameLogic from '../hooks/useGameLogic';
import useNewsletterForm from '../hooks/useNewsletterForm';

const GameScreen = () => {
  const imageWidth = 8192;
  const imageHeight = 8192;

  const panoramas = useMemo(() => [
    {
      url: '/images/13.jpg',
      position: { x: 6294, y: 3973 },
    },
    {
      url: '/images/14.jpg',
      position: { x: 3495, y: 3973 },
    },
  ], []);
  
  const [cleanupMapFunction, setCleanupMapFunction] = useState(null);

  const {
    hfov,
    vaov,
    globalScore,
    showResult,
    isPortrait,
    currentIndex,
    handleChooseClick
  } = useGameLogic(panoramas, cleanupMapFunction);
  const { showNewsletterForm, handleMouseEnter, handleMouseLeave } = useNewsletterForm();


  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: isPortrait ? 'column' : 'row'
    }}>
      <PanoramaViewer
        panoramaUrl={panoramas[currentIndex].url}
        hfov={hfov}
        vaov={vaov}
        isPortrait={isPortrait}
      />

      {isPortrait && (
        <PortraitMap
          handleChooseClick={handleChooseClick}
          imageUrl="/images/erangel.jpg"
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          targetPosition={panoramas[currentIndex].position}
          isPortrait={isPortrait}
          setCleanupMap={setCleanupMapFunction}
        />
      )}

      <NewsletterIcon
        showNewsletterForm={showNewsletterForm}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
      />

      {!isPortrait && (
        <LandscapeMinimap
          handleChooseClick={handleChooseClick}
          imageUrl="/images/erangel.jpg"
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          targetPosition={panoramas[currentIndex].position}
          isPortrait={isPortrait}
          onCleanupMap={setCleanupMapFunction}
        />
      )}

      {showResult && <ScoreDisplay score={globalScore} />}
    </div>
  );
};

export default GameScreen;
