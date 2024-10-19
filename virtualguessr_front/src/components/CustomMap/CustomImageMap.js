// CustomImageMap.js
import React from 'react';
import useMapLogic from './useMapLogic';
import useScoreCalculation from './useScoreCalculation';
import useMapResize from './useMapResize';
import MapContainer from './MapContainer';
import FullscreenMap from './FullscreenMap';
import { useGameContext } from '../../contexts/GameContext';

const CustomImageMap = ({ imageUrl, imageWidth, imageHeight, targetPosition, onNextImage, style }) => {
    const {
      userPosition,
      setUserPosition,
      isFullScreen,
      setIsFullScreen,
    } = useGameContext();
    const {
      mapInstanceRef,
      mapRef,
      fullscreenMapRef,
      fullscreenMapInstanceRef,
      handleMapClick,
      initializeMap,
      cleanupMap
    } = useMapLogic(imageUrl, targetPosition, imageWidth, imageHeight);

    const { score, calculateScore } = useScoreCalculation(imageWidth, imageHeight);

    const { mapSize, isExpanded, handleResize, resetExpand } = useMapResize(mapInstanceRef);

    const handleChooseClick = () => {
        if (!userPosition) return;
        setIsFullScreen(true);
        calculateScore(userPosition, targetPosition);
    };

    const handleNextClick = () => {
        setIsFullScreen(false);
        resetExpand();
        setUserPosition(null);

        onNextImage();
        cleanupMap();
    };

    return (
        <>
            <MapContainer
                mapRef={mapRef}
                mapSize={mapSize}
                isExpanded={isExpanded}
                isFullScreen={isFullScreen}
                handleResize={handleResize}
                handleMapClick={handleMapClick}
                handleChooseClick={handleChooseClick}
                style={style}
            />
            {isFullScreen && (
                <FullscreenMap
                    fullscreenMapRef={fullscreenMapRef}
                    fullscreenMapInstanceRef={fullscreenMapInstanceRef}
                    score={score}
                    handleNextClick={handleNextClick}
                    initializeMap={initializeMap}
                    userPosition={userPosition}
                    targetPosition={targetPosition}
                />
            )}
        </>
    );
};

export default CustomImageMap;
