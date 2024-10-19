// CustomImageMap.js
import React, { useEffect } from 'react';
import useMapLogic from '../../hooks/useMapLogic';
import useScoreCalculation from '../../hooks/useScoreCalculation';
import MapContainer from './MapContainer';
import FullscreenMap from './FullscreenMap';
import { useGameContext } from '../../contexts/GameContext';

const CustomImageMap = ({ imageUrl, imageWidth, imageHeight, targetPosition, style, onCleanupMap: setCleanupMap }) => {
    const {
        isFullScreen,
    } = useGameContext();

    const { calculateScore} = useScoreCalculation(imageWidth, imageHeight);
    const {
        mapSize,
        mapRef,
        fullscreenMapRef,
        fullscreenMapInstanceRef,
        handleMapClick,
        initializeMap,
        isPortrait,
        isExpanded,
        cleanupMap,
        handleResize,
        handleChooseClick,
        handleNextClick

    } = useMapLogic(imageUrl, targetPosition, imageWidth, imageHeight, calculateScore);
    
    useEffect(() => {
        if (setCleanupMap) {
            setCleanupMap(cleanupMap);
        }
    }, [setCleanupMap, cleanupMap]);

    return (
        <>
            <MapContainer
                mapRef={mapRef}
                mapSize={mapSize}
                handleResize={handleResize}
                handleMapClick={handleMapClick}
                handleChooseClick={handleChooseClick}
                style={style}
                isPortrait={isPortrait}
                isExpanded={isExpanded}
            />
            {isFullScreen && (
                <FullscreenMap
                    fullscreenMapRef={fullscreenMapRef}
                    fullscreenMapInstanceRef={fullscreenMapInstanceRef}
                    handleNextClick={handleNextClick}
                    initializeMap={initializeMap}
                />
            )}
        </>
    );
};

export default CustomImageMap;
