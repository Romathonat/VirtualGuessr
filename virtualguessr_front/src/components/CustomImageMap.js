import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CustomImageMap = ({ imageUrl, imageWidth, imageHeight }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [mapSize, setMapSize] = useState(400);

    const calculateMinZoom = useCallback(() => {
        const maxMapSize = Math.max(800, 400); // Utilise la plus grande taille possible
        return -Math.log(imageWidth / maxMapSize) / Math.log(2);
    }, [imageWidth]);

    const initializeMap = useCallback(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const minZoom = calculateMinZoom();
        const map = L.map(mapRef.current, {
            crs: L.CRS.Simple,
            minZoom: minZoom,
            maxZoom: 2,
            zoomSnap: 0,
            zoomDelta: 0.1,
            attributionControl: false,
            maxBoundsViscosity: 1.0
        });

        const bounds = [[0, 0], [imageHeight, imageWidth]];
        const overlay = L.imageOverlay(imageUrl, bounds);
        overlay.addTo(map);
        map.setMaxBounds(bounds);
        map.fitBounds(bounds);

        const customIcon = L.icon({
            iconUrl: '/images/logo_16.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        const handleMapClick = (e) => {
            if (markerRef.current) {
                markerRef.current.setLatLng(e.latlng);
            } else {
                markerRef.current = L.marker(e.latlng, { icon: customIcon }).addTo(map);
            }
        };

        map.on('click', handleMapClick);
        mapInstanceRef.current = map;
    }, [imageUrl, imageWidth, imageHeight, calculateMinZoom]);

    useEffect(() => {
        initializeMap();
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            markerRef.current = null;
        };
    }, [initializeMap]);

    const animateResize = useCallback((start, end, duration) => {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Easing function
            const currentSize = start + (end - start) * easeProgress;
            setMapSize(currentSize);

            if (mapInstanceRef.current) {
                const map = mapInstanceRef.current;
                const prevCenter = map.getCenter();
                const prevZoom = map.getZoom();
                map.invalidateSize();
                map.setView(prevCenter, prevZoom, { animate: false });
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
        animateResize(400, 800, 300);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        animateResize(800, 400, 300);
    };

    return (
        <div
            ref={mapRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                width: `${mapSize}px`,
                height: `${mapSize}px`,
                cursor: 'crosshair'
            }}
        />
    );
};

export default CustomImageMap;