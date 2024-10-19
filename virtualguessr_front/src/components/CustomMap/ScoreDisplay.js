import React from 'react';

const ScoreDisplay = ({ score }) => {
    if (score === null) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '5px',
            fontSize: '35px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 1001
        }}>
            Score: {score}
        </div>
    );
};

export default ScoreDisplay;