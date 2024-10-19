import React from 'react';
import CustomImageMap from './CustomImageMap';

const LandscapeMinimap = React.memo(({ imageUrl, imageWidth, imageHeight, targetPosition, isPortrait, handleChooseClick }) => (
  <div style={{
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    borderRadius: '10px',
    overflow: 'hidden'
  }}>
    <CustomImageMap
      imageUrl={imageUrl}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      targetPosition={targetPosition}
      isPortrait={isPortrait}
      handleChooseClick={handleChooseClick}
    />
  </div>
));

export default LandscapeMinimap;
