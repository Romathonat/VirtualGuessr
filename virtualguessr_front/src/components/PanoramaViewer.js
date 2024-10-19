import React, { useEffect, useRef } from 'react';
import 'pannellum';
import 'pannellum/build/pannellum.css';

const PanoramaViewer = ({ panoramaUrl, hfov, vaov, isPortrait }) => {
  const containerRef = useRef(null);
  const pannellumRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && window.pannellum) {
      if (pannellumRef.current) {
        pannellumRef.current.destroy();
      }
      
      pannellumRef.current = window.pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        compass: false,
        showZoomCtrl: false,
        mouseZoom: false,
        hfov: hfov,
        vaov: vaov,
        minPitch: -17,
        maxPitch: 17,
        pitch: 0,
        showFullscreenCtrl: false,
        keyboardZoom: false,
        disableKeyboardCtrl: true,
      });
    }
  }, [panoramaUrl, isPortrait, hfov, vaov]);

  return (
    <div
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: isPortrait ? '50vh' : '100%'
      }}
    ></div>
  );
};

export default PanoramaViewer;
