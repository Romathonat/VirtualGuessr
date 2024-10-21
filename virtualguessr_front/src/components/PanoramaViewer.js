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
        type: 'cubemap',
        "cubeMap": [
          `${panoramaUrl}/front.jpg`,
          `${panoramaUrl}/right.jpg`,
          `${panoramaUrl}/back.jpg`,
          `${panoramaUrl}/left.jpg`,
          `${panoramaUrl}/top.jpg`,
          `${panoramaUrl}/bottom.jpg`,
        ],
        autoLoad: true,
        compass: false,
        showZoomCtrl: false,
        mouseZoom: true,
        showFullscreenCtrl: false,
        keyboardZoom: false,
        disableKeyboardCtrl: true,
        hfov: isPortrait ? 60 : 120,
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
