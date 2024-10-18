import React from 'react';
import GuessButton from './GuessButton';

const MapContainer = ({ mapRef, mapSize, isExpanded, isFullScreen, handleResize, handleMapClick, handleChooseClick }) => (
    <div
        ref={mapRef}
        onMouseEnter={() => !isFullScreen && handleResize(true)}
        onMouseLeave={() => !isFullScreen && handleResize(false)}
        onClick={handleMapClick}
        style={{
            width: `${mapSize}px`,
            height: `${mapSize}px`,
            cursor: 'crosshair'
        }}
    >
        {isExpanded && !isFullScreen && (
            <GuessButton onClick={handleChooseClick} />
        )}
    </div>
);

export default MapContainer;
