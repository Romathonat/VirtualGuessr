import React from 'react';

const ScoreDisplay = React.memo(({ score }) => (
  <div style={{
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px'
  }}>
    Score: {score}
  </div>
));

export default ScoreDisplay;
