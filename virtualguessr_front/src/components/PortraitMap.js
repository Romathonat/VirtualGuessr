import React from 'react';
import CustomImageMap from './CustomMap/CustomImageMap';

const PortraitMap = React.memo(({ imageUrl, imageWidth, imageHeight, targetPosition, onNextImage, isPortrait, handleChooseClick }) => (
  <div style={{
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <CustomImageMap
      imageUrl={imageUrl}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      targetPosition={targetPosition}
      onNextImage={onNextImage}
      isPortrait={isPortrait}
      handleChooseClick={handleChooseClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  </div>
));

export default PortraitMap;
