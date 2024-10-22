import React, { useEffect, useState } from 'react';
import ScoreDisplay from './ScoreDisplay';
import L from 'leaflet';
import { useGameContext } from '../../contexts/GameContext';

const FullscreenMap = ({ fullscreenMapRef, fullscreenMapInstanceRef, handleNextClick, initializeMap }) => {
    const { score, userPosition, targetPosition } = useGameContext();
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const map = initializeMap(fullscreenMapRef.current, fullscreenMapInstanceRef);

        if (map && userPosition && targetPosition) {
            const customPointer = L.icon({
                iconUrl: '/images/pointer.png',
                iconSize: [26, 39],
                iconAnchor: [13, 39],
            });

            const flagIcon = L.icon({
                iconUrl: '/images/target.png',
                iconSize: [26, 40],
                iconAnchor: [13, 40],
            });

            const userMarker = L.marker([userPosition.lat, userPosition.lng], { icon: customPointer });
            const targetMarker = L.marker([targetPosition.y, targetPosition.x], { icon: flagIcon });

            const bounds = L.latLngBounds([userPosition, [targetPosition.y, targetPosition.x]]).pad(0.1);
            map.fitBounds(bounds);

            map.once('moveend', () => {
                userMarker.addTo(map);
                targetMarker.addTo(map);

                const line = L.polyline([], { color: 'white', dashArray: '10, 10' });

                const drawLine = (progress) => {
                    const lat = userPosition.lat + (targetPosition.y - userPosition.lat) * progress;
                    const lng = userPosition.lng + (targetPosition.x - userPosition.lng) * progress;
                    line.addLatLng([lat, lng]);

                    if (progress < 1) {
                        requestAnimationFrame(() => drawLine(progress + 0.01)); // Réduit de 0.05 à 0.01
                    }
                };

                line.addTo(map);
                drawLine(0);

                // Ajoutez ces lignes
                setTimeout(() => {
                    map.invalidateSize();
                    map.fitBounds(bounds);
                }, 100);
            });
        }

    }, [initializeMap, fullscreenMapRef, fullscreenMapInstanceRef, userPosition, targetPosition]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba( , 0, 0, 0.8)',
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
                    [isPortrait ? 'top' : 'bottom']: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1001
                }}>
                    <button onClick={handleNextClick} style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        backgroundColor: '#2B4B6F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}>
                        Next
                    </button>
                </div>
                <ScoreDisplay score={score} />
            </div>
        </div>
    );
};

export default FullscreenMap;
