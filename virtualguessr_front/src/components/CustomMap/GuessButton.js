// GuessButton.js
import React from 'react';

const GuessButton = ({ onClick }) => (
    <button
        className="guess-button"
        onClick={onClick}
        style={{
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        }}
    >
        Guess
    </button>
);

export default GuessButton;