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
      position: { x: 6016, y: 3584 },
    },
    {
      url: '/images/cubemap/2',
      position: { x: 6256, y: 3848 },
    },
    {
      url: '/images/cubemap/3',
      position: { x: 5800, y: 4800 },
    },
    {
      url: '/images/cubemap/4',
      position: { x: 5752, y: 4216 },
    },
    {
      url: '/images/cubemap/5',
      position: { x: 4440, y: 6760 },
    },
    {
      url: '/images/cubemap/6',
      position: { x: 3720, y: 6816 },
    },
  ], []);
  
  const [cleanupMapFunction, setCleanupMapFunction] = useState(null);

  const {
    hfov,
    vaov,
    globalScore,
    showResult,
    isPortrait,
    isFullScreen,
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
        isFullScreen={isFullScreen}
        isPortrait={isPortrait}
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
