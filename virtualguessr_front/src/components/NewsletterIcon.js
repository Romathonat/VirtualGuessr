import React from 'react';
import { Mail } from "lucide-react";
import NewsletterSignup from './NewsletterSignup';

const NewsletterIcon = React.memo(({ showNewsletterForm, handleMouseEnter, handleMouseLeave, isPortrait, isFullScreen }) => {
  // Si isPortrait et isFullScreen sont vrais, ne rien rendre
  if (isPortrait && isFullScreen) {
    return null;
  }

  return (
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
  );
});

export default NewsletterIcon;
