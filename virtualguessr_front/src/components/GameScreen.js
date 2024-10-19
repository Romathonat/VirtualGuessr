import React, { useState, useEffect, useRef } from 'react';
import 'pannellum';
import 'pannellum/build/pannellum.css';

import { Mail } from "lucide-react";
import CustomImageMap from './CustomMap/CustomImageMap';
import NewsletterSignup from './NewsletterSignup';
import { useGameContext } from '../contexts/GameContext';

const GameScreen = () => {
  const {
    globalScore,
    showResult,
    isPortrait,
    setIsPortrait,
    currentIndex,
    setCurrentIndex
  } = useGameContext();

  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [hfov, setHfov] = useState(window.innerWidth / 13762 * 360);
  const [vaov, setVaov] = useState(window.innerHeight / 1306 * 41.7);
  
  const timeoutRef = useRef(null);
  const pannellumRef = useRef(null);
  const containerRef = useRef(null);

  const imageWidth = 8192;
  const imageHeight = 8192;

  const panoramas = [
    { 
      url: '/images/13.jpg', 
      position: { x: 6294, y: 3973 },
    },
    { 
      url: '/images/14.jpg', 
      position: { x: 3495, y: 3973 },
    },
  ];

  const handleResize = () => {
    const newIsPortrait = window.innerHeight > window.innerWidth;
    setIsPortrait(newIsPortrait);
    setHfov(window.innerWidth / 13762 * 360);
    setVaov(window.innerHeight / 1306 * 41.7);
    
    if (pannellumRef.current) {
      pannellumRef.current.setHfov(window.innerWidth / 13762 * 360);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (containerRef.current && window.pannellum) {
      if (pannellumRef.current) {
        pannellumRef.current.destroy();
      }
      
      pannellumRef.current = window.pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: panoramas[currentIndex].url,
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
        disableKeyboardCtrl: true, // Ajoutez cette ligne
      });
    }
  }, [currentIndex, isPortrait, hfov, vaov]);

  const handleNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % panoramas.length);
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowNewsletterForm(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowNewsletterForm(false);
    }, 500);
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
      display: 'flex',
      flexDirection: isPortrait ? 'column' : 'row'
    }}>
      <div
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: isPortrait ? '50vh' : '100%'
        }}
      ></div>

      {isPortrait && (
        <div style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CustomImageMap
            imageUrl="/images/erangel.jpg"
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            targetPosition={panoramas[currentIndex].position}
            onNextImage={handleNextImage}
            isPortrait={isPortrait}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      )}

      {/* Icône de mail et formulaire de newsletter */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Mail
          size={32}
          color="white"
          style={{
            cursor: 'pointer',
            background: 'rgba(0,0,0,0.5)',
            padding: '5px',
            borderRadius: '50%'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'rgb(240, 233, 213)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '300px',
            transition: 'all 0.3s ease',
            opacity: showNewsletterForm ? 1 : 0,
            visibility: showNewsletterForm ? 'visible' : 'hidden',
            transform: `translateY(${showNewsletterForm ? '0' : '-10px'})`,
            pointerEvents: showNewsletterForm ? 'auto' : 'none',
          }}
        >
          <NewsletterSignup />
        </div>
      </div>

      {/* Minimap dans le coin inférieur droit (seulement en mode paysage) */}
      {!isPortrait && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <CustomImageMap
            imageUrl="/images/erangel.jpg"
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            targetPosition={panoramas[currentIndex].position}
            onNextImage={handleNextImage}
            isPortrait={isPortrait}
          />
        </div>
      )}

      {/* Affichage du score */}
      {showResult && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px'
        }}>
          Score: {globalScore}
        </div>
      )}
    </div>
  );
};

export default GameScreen;
