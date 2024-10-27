import React, { useState, useEffect } from 'react';
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

  // const [panoramas, setPanoramas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cleanupMapFunction, setCleanupMapFunction] = useState(null);

  const {
    panoramas,
    setPanoramas,
    hfov,
    vaov,
    globalScore,
    showResult,
    isPortrait,
    isFullScreen,
    currentIndex,
    handleChooseClick
  } = useGameLogic();

  const { showNewsletterForm, handleMouseEnter, handleMouseLeave } = useNewsletterForm();

  useEffect(() => {
    setIsLoading(true);
    fetch('/images/cubemap/positions.csv')
      .then(response => response.text())
      .then(data => {
        const rows = data.split('\n').slice(1); // Ignorer l'en-tête
        const parsedPanoramas = rows.map(row => {
          const [nom, x, y] = row.split(',');
          const number = nom.split('_')[0];
          return {
            url: `/images/cubemap/${number}`,
            position: { x: parseInt(x), y: parseInt(y) }
          };
        });
        setPanoramas(parsedPanoramas);
        console.log('panoramas', parsedPanoramas);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement du CSV:', error);
        setIsLoading(false);
      });
  }, [setPanoramas]);


  if (isLoading || panoramas.length === 0) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: isPortrait ? 'column' : 'row'
    }}>
      <PanoramaViewer
        panoramaUrl={panoramas[currentIndex]?.url}
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
          targetPosition={panoramas[currentIndex]?.position}
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
          targetPosition={panoramas[currentIndex]?.position}
          isPortrait={isPortrait}
          onCleanupMap={setCleanupMapFunction}
        />
      )}

      {showResult && <ScoreDisplay score={globalScore} />}
    </div>
  );
};

export default GameScreen;
