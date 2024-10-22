import React from 'react';
import GuessButton from './GuessButton';

const MapContainer = ({ mapRef, mapSize, isExpanded, isFullScreen, handleResize, handleMapClick, handleChooseClick, style, isPortrait }) => (
    <div
        ref={mapRef}
        onMouseEnter={() => !isFullScreen && handleResize(true)}
        onMouseLeave={() => !isFullScreen && handleResize(false)}
        onClick={handleMapClick}
        style={{
            width: `${mapSize}px`,
            height: `${mapSize}px`,
            cursor: 'crosshair',
            position: 'relative',
            ...style
        }}
    >
        {(isExpanded || isPortrait) && !isFullScreen && (
            <GuessButton 
                onClick={handleChooseClick} 
                isPortrait={isPortrait}
                style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
            />
        )}
    </div>
);

export default MapContainer;
