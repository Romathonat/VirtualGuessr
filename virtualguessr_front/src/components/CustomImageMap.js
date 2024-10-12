import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CustomImageMap = ({ imageUrl, imageWidth, imageHeight, targetPosition, onNextImage }) => {
    const mapRef = useRef(null);
    const fullscreenMapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const fullscreenMapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const targetMarkerRef = useRef(null);
    const [score, setScore] = useState(null);
    const resizeTimeoutRef = useRef(null);
    const [mapSize, setMapSize] = useState(400);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [userPosition, setUserPosition] = useState(null);

    const calculateMinZoom = useCallback(() => {
        const maxMapSize = Math.max(800, 400);
        return -Math.log(imageWidth / maxMapSize) / Math.log(2);
    }, [imageWidth]);

    const initializeMap = useCallback((mapContainer, mapInstance) => {
        if (!mapContainer || mapInstance.current) return;

        const minZoom = calculateMinZoom();
        const map = L.map(mapContainer, {
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

        map.on('click', handleMapClick);
        mapInstance.current = map;
    }, [imageUrl, imageWidth, imageHeight, calculateMinZoom]);

    useEffect(() => {
        initializeMap(mapRef.current, mapInstanceRef);
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            if (fullscreenMapInstanceRef.current) {
                fullscreenMapInstanceRef.current.remove();
                fullscreenMapInstanceRef.current = null;
            }
            userMarkerRef.current = null;
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [initializeMap]);

    const handleMapClick = useCallback((e) => {
        if (isFullScreen) return;

        const guessButton = document.querySelector('.guess-button');
        if (guessButton && guessButton.contains(e.originalEvent.target)) {
            return;  // Ne rien faire si le clic est sur le bouton
        }


        const customIcon = L.icon({
            iconUrl: '/images/logo_16.png',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        });

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(e.latlng);
        } else {
            userMarkerRef.current = L.marker(e.latlng, { icon: customIcon }).addTo(mapInstanceRef.current);
        }
        setUserPosition(e.latlng);
        console.log("event"+e.latlng);
    }, [isFullScreen]);

    const computeDistance = (point1, point2) => {
        const dx = point1.lng - point2.x;
        const dy = point1.lat - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const computeScore = (distance) => {
        const maxScore = 5000;
        const maxDistance = Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight);
        const normalizedDistance = distance / maxDistance;
        const score = maxScore * Math.exp(-5 * normalizedDistance);
        return Math.round(score);
    };

    const handleChooseClick = useCallback(() => {
        if (!userPosition) return;
        setIsFullScreen(true);

        setTimeout(() => {
            initializeMap(fullscreenMapRef.current, fullscreenMapInstanceRef);
            const map = fullscreenMapInstanceRef.current;

            const customIcon = L.icon({
                iconUrl: '/images/logo_16.png',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });

            // console.log(userPosition);
            // console.log(targetPosition);
            const userMarker = L.marker([userPosition.lat, userPosition.lng], { icon: customIcon });
            const targetMarker = L.marker([targetPosition.y, targetPosition.x]);

            const bounds = L.latLngBounds([userPosition, [targetPosition.y, targetPosition.x]]).pad(0.1);
            map.fitBounds(bounds);

            // Calcul du score
            const distance = computeDistance(userPosition, targetPosition);
            const newScore = computeScore(distance);
            setScore(newScore);

            map.once('moveend', () => {
                userMarker.addTo(map);
                targetMarker.addTo(map);

                const line = L.polyline([], { color: 'white', dashArray: '10, 10' });

                const drawLine = (progress) => {
                    const lat = userPosition.lat + (targetPosition.y - userPosition.lat) * progress;
                    const lng = userPosition.lng + (targetPosition.x - userPosition.lng) * progress;
                    line.addLatLng([lat, lng]);

                    if (progress < 1) {
                        requestAnimationFrame(() => drawLine(progress + 0.05));
                    }
                };

                line.addTo(map);
                drawLine(0);
            });
        }, 0);
    }, [initializeMap, userPosition, targetPosition, imageWidth, imageHeight]);


    const handleNextClick = useCallback(() => {
        setIsFullScreen(false);
        setIsExpanded(false);
        setUserPosition(null);
        setMapSize(400); // Reset to initial size

        if (userMarkerRef.current) {
            userMarkerRef.current.removeFrom(mapInstanceRef.current);
            userMarkerRef.current = null;
        }
        if (fullscreenMapInstanceRef.current) {
            fullscreenMapInstanceRef.current.remove();
            fullscreenMapInstanceRef.current = null;
        }
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(mapInstanceRef.current.getCenter(), calculateMinZoom());
            mapInstanceRef.current.invalidateSize();
        }
        onNextImage();
    }, [onNextImage, calculateMinZoom]);

    const animateResize = useCallback((start, end, duration) => {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
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
            } else {
                setIsExpanded(end === 800);
            }
        };
        requestAnimationFrame(animate);
    }, []);

    const handleResize = useCallback((shouldExpand) => {
        if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
        }

        resizeTimeoutRef.current = setTimeout(() => {
            if (shouldExpand !== isExpanded) {
                animateResize(shouldExpand ? 400 : 800, shouldExpand ? 800 : 400, 300);
            }
        }, 100);
    }, [animateResize, isExpanded]);

    return (
        <>
            <div
                ref={mapRef}
                onMouseEnter={() => !isFullScreen && handleResize(true)}
                onMouseLeave={() => !isFullScreen && handleResize(false)}
                style={{
                    width: `${mapSize}px`,
                    height: `${mapSize}px`,
                    cursor: 'crosshair'
                }}
            >
                {isExpanded && !isFullScreen && (
                    <button
                        className="guess-button"
                        onClick={handleChooseClick}
                        style={{
                            position: 'absolute',
                            bottom: '15px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1000,
                            padding: '10px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Guess
                    </button>
                )}
            </div>
            {isFullScreen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '90%',
                        height: '90%',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div ref={fullscreenMapRef} style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 1001
                        }}>
                            <button onClick={handleNextClick} style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}>
                                Next
                            </button>
                        </div>
                        {score !== null && (
                            <div style={{
                                position: 'absolute',
                                bottom: '50px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '10px 20px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '5px',
                                fontSize: '35px',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                zIndex: 1001
                            }}>
                                Score: {score}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomImageMap;