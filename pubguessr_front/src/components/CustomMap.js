import React, { useRef, useEffect, useState } from 'react';

const CustomMap = ({ actualPosition }) => {
  const canvasRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null);
  const [showActualMarker, setShowActualMarker] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
      
      if (showActualMarker && actualPosition) {
        drawMarker(ctx, actualPosition.x, actualPosition.y, 'green');
        
        if (userMarker) {
          drawDashedLine(ctx, userMarker, actualPosition);
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
    if (showActualMarker || isDragging) {
      return;
    }
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / zoom;
    const y = (event.clientY - rect.top - offset.y) / zoom;
    setUserMarker({ x, y });
  };

  const handleChooseClick = () => {
    setShowActualMarker(true);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(1, Math.min(5, zoom * zoomFactor));
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    let newOffsetX, newOffsetY;

    if (zoomFactor > 1){
      newOffsetX = mouseX - (mouseX - offset.x) * (newZoom / zoom);
      newOffsetY = mouseY - (mouseY - offset.y) * (newZoom / zoom);
    }
    else{
      newOffsetX = (mouseX - (mouseX - offset.x) * (newZoom / zoom)) / 2 ;
      newOffsetY = (mouseY - (mouseY - offset.y) * (newZoom / zoom)) / 2;
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
      const newOffset = {
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      };
      if (zoom > 1)
      {
        setOffset(newOffset);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div>
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ maxWidth: '100%', height: 'auto', cursor: isDragging ? 'grabbing' : 'grab' }} 
      />
      <button onClick={handleChooseClick} style={{ marginTop: '10px' }}>Choose</button>
    </div>
  );
};

export default CustomMap;