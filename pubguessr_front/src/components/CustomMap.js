import React, { useRef, useEffect, useState } from 'react';

const CustomMap = ({ targetPosition, onScore }) => {
  const canvasRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null);
  const [showActualMarker, setShowActualMarker] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    // img.onload = () => {
    //   setImageSize({ width: img.width, height: img.height });
    // };
    img.src = '/images/erangel.jpg'; // Assurez-vous que ce chemin est correct
  }, []);

  useEffect(() => {
    drawMap();
  }, [userMarker, showActualMarker, zoom, offset]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);
      
      ctx.drawImage(img, 0, 0);
      
      if (userMarker) {
        drawMarker(ctx, userMarker.x, userMarker.y, 'red');
      }
      
      if (showActualMarker && targetPosition) {
        drawMarker(ctx, targetPosition.x, targetPosition.y, 'green');
        
        if (userMarker) {
          drawDashedLine(ctx, userMarker, targetPosition);
        }
      }
      
      ctx.restore();
    };
    
    img.src = '/images/erangel.jpg';
  };

  const drawMarker = (ctx, x, y, color) => {
    ctx.beginPath();
    ctx.arc(x, y, 5 / zoom, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();
  };

  const drawDashedLine = (ctx, start, end) => {
    ctx.beginPath();
    ctx.setLineDash([5 / zoom, 5 / zoom]);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const handleCanvasClick = (event) => {
    if (showActualMarker) {
      return; // Empêche de placer un nouveau marqueur après avoir choisi
    }
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    // Rapport entre la taille logique et la taille d'affichage
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Appliquer le zoom et l'offset inverse pour obtenir la position réelle sur l'image
    const imageX = (x - offset.x) / zoom;
    const imageY = (y - offset.y) / zoom;

    setUserMarker({ x: imageX, y: imageY });
  };

  const computeDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const computeScore = (distance) => {
    const maxScore = 5000;
    const maxDistance = Math.sqrt(canvasRef.current.width * canvasRef.current.width + canvasRef.current.height * canvasRef.current.height);
    
    // Fonction exponentielle inverse pour le calcul du score
    const normalizedDistance = distance / maxDistance;
    const score = maxScore * Math.exp(-5 * normalizedDistance);
    
    return Math.round(score);
  };

  const handleChooseClick = () => {
    if (userMarker) {
      const distance = computeDistance(userMarker, targetPosition);
      const newScore = computeScore(distance);
      onScore(newScore); // Communique le score au composant parent
    } else {
        alert("Veuillez placer un marqueur avant de choisir.");
    }
      setShowActualMarker(true);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(1, Math.min(5, zoom * zoomFactor));
   
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate the position of the mouse relative to the canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
   
    // Calculate the position of the mouse relative to the image at current zoom
    const imageX = (mouseX - offset.x) / zoom;
    const imageY = (mouseY - offset.y) / zoom;

    let newOffsetX, newOffsetY;

    // Calculate new offsets to keep the point under the mouse in the same position
    newOffsetX = mouseX - imageX * newZoom;
    newOffsetY = mouseY - imageY * newZoom;

    // If zooming out to 1, center the image
    if (newZoom === 1) {
      newOffsetX = (rect.width - rect.width) / 2;
      newOffsetY = (rect.height - rect.height) / 2;
    } else {
      // Apply bounds to prevent white space
      const maxOffsetX = 0;
      const maxOffsetY = 0;
      const minOffsetX = Math.min(0, rect.width - rect.width * newZoom);
      const minOffsetY = Math.min(0, rect.height - rect.height * newZoom);
      
      newOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, newOffsetX));
      newOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, newOffsetY));
    }

    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseDown = (event) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y
      });
    }
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      let newOffsetX = event.clientX - dragStart.x;
      let newOffsetY = event.clientY - dragStart.y;

      // Calculer les limites de déplacement
      const minOffsetX = rect.width - rect.width * zoom;
      const minOffsetY = rect.height - rect.height * zoom;

      // Appliquer les limites
      newOffsetX = Math.min(0, Math.max(newOffsetX, minOffsetX));
      newOffsetY = Math.min(0, Math.max(newOffsetY, minOffsetY));

      if (zoom > 1)
      {
        setOffset({ x: newOffsetX, y: newOffsetY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };


  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab' }} 
      />
      <button 
        onClick={handleChooseClick} 
        style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
      >
        Choose
      </button>
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '5px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 10
        }}
      >
      </div>
    </div>
  );
};

export default CustomMap;