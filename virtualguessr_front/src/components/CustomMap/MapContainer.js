import React from 'react';
import GuessButton from './GuessButton';

const MapContainer = ({ mapRef, mapSize, isExpanded, isFullScreen, handleResize, handleMapClick, handleChooseClick, style }) => (
    <div
        ref={mapRef}
        onMouseEnter={() => !isFullScreen && handleResize(true)}
        onMouseLeave={() => !isFullScreen && handleResize(false)}
        onClick={handleMapClick}
        style={{
            width: `${mapSize}px`,
            height: `${mapSize}px`,
            cursor: 'crosshair',
            ...style
        }}
    >
        {isExpanded && !isFullScreen && (
            <GuessButton onClick={handleChooseClick} />
        )}
    </div>
);

export default MapContainer;
