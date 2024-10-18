// CustomImageMap.js
import React from 'react';
import useMapLogic from './useMapLogic';
import useScoreCalculation from './useScoreCalculation';
import useMapResize from './useMapResize';
import MapContainer from './MapContainer';
import FullscreenMap from './FullscreenMap';

const CustomImageMap = ({ imageUrl, imageWidth, imageHeight, targetPosition, onNextImage }) => {
    const {
        mapRef,
        fullscreenMapRef,
        mapInstanceRef,
        fullscreenMapInstanceRef,
        handleMapClick,
        isFullScreen,
        setIsFullScreen,
        userPosition,
        setUserPosition,
        initializeMap,
        cleanupMap
    } = useMapLogic(imageUrl, imageWidth, imageHeight);

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
