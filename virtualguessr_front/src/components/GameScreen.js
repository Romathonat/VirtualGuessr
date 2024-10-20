import React, { useState, useMemo } from 'react';
import PortraitMap from './CustomMap/PortraitMap';
import LandscapeMinimap from './CustomMap/LandscapeMinimap';
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
      url: '/images/cubemap/1',
      position: { x: 3968, y: 5632 },
    },
    {
      url: '/images/cubemap/2',
      position: { x: 6088, y: 3720 },
    },
    {
      url: '/images/cubemap/3',
      position: { x: 6256, y: 3856 },
    },
    {
      url: '/images/cubemap/4',
      position: { x: 5648, y: 5000 },
    },
    {
      url: '/images/cubemap/5',
      position: { x: 4040, y: 6368 },
    },
    {
      url: '/images/cubemap/6',
      position: { x: 4312, y: 5792 },
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
