import React from 'react';

const GuessButton = ({ onClick, isPortrait }) => (
    <button
        className="guess-button"
        onClick={onClick}
        style={{
            position: 'absolute',
            top: isPortrait ? '10px' : 'auto',
            bottom: isPortrait ? 'auto' : '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#9B2E2E',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            border: '1px solid white', // Ajout de la bordure blanche
            cursor: 'pointer',
        }}
    >
        Guess
    </button>
);

export default GuessButton;