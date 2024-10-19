import { useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './CustomShovelIcon.module.css';
import { useGameContext } from '../contexts/GameContext';


const useMapLogic = (imageUrl, targetPosition, imageWidth, imageHeight, calculateScore) => {
    const mapRef = useRef(null);
    const fullscreenMapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const fullscreenMapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const resizeTimeoutRef = useRef(null);
    const {
        userPosition,
        setUserPosition,
        isFullScreen,
        setIsFullScreen,
        setTargetPosition,
        setCurrentIndex,
        panoramas,
        mapSize,
        setMapSize,
        isExpanded,
        isPortrait,
        setIsExpanded,
    } = useGameContext();

    const calculateMinZoom = useCallback(() => {
        const maxMapSize = Math.max(800, 400);
        return -Math.log(imageWidth / maxMapSize) / Math.log(2);
    }, [imageWidth]);

    const cleanupMap = useCallback(() => {
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
    }, [calculateMinZoom]);

    const handleChooseClick = () => {
        if (!userPosition) return;
        setIsFullScreen(true);
        calculateScore(userPosition, targetPosition);
    };

    const handleNextClick = () => {
        setIsFullScreen(false);
        setUserPosition(null);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % panoramas.length);
        resetExpand();
        cleanupMap();
    };

    const initializeMap = useCallback((mapContainer, mapInstance) => {
        if (!mapContainer || mapInstance.current) return null;
        const minZoom = calculateMinZoom();
        const map = L.map(mapContainer, {
            crs: L.CRS.Simple,
            minZoom: minZoom,
            maxZoom: 2,
            zoomSnap: 0,
            zoomDelta: 0.1,
            attributionControl: false,
            maxBoundsViscosity: 1.0,
            fullscreenControl: false
        });

        const bounds = [[0, 0], [imageHeight, imageWidth]];
        const overlay = L.imageOverlay(imageUrl, bounds);
        overlay.addTo(map);
        map.setMaxBounds(bounds);
        
        // Ajuster le zoom et la position pour remplir l'espace
        const containerSize = mapContainer.getBoundingClientRect();
        const imageRatio = imageWidth / imageHeight;
        const containerRatio = containerSize.width / containerSize.height;
        
        let zoom;
        if (containerRatio > imageRatio) {
            zoom = Math.log2(containerSize.width / imageWidth);
        } else {
            zoom = Math.log2(containerSize.height / imageHeight);
        }
        
        map.setView([imageHeight / 2, imageWidth / 2], zoom);

        map.on('click', handleMapClick);
        mapInstance.current = map;

        return map; // Retourner l'instance de la carte
    }, [imageUrl, imageWidth, imageHeight, calculateMinZoom]);

    const handleMapClick = useCallback((e) => {
        const target = e.originalEvent ? e.originalEvent.target : e.target;
        const clickOnGuessButton = target && target.classList && target.classList.contains('guess-button')
        if (isFullScreen || !e.latlng || clickOnGuessButton) return;

        if (target && target.classList && target.classList.contains('guess-button')) {
            return;
        }

        const customShovelIcon = L.divIcon({
            className: styles.customShovelIcon,
            html: `<div style="background-image: url('/images/shovel_icon.png')" class="${styles.shovelIconInner}"></div>`,
            iconSize: [22, 61],
            iconAnchor: [11, 61],
        });

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(e.latlng);
        } else {
            userMarkerRef.current = L.marker(e.latlng, { icon: customShovelIcon }).addTo(mapInstanceRef.current);
        }

        setUserPosition(e.latlng);
    }, [isFullScreen]);

    const animateResize = useCallback((start, end, mapInstanceRef, duration) => {
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
    }, [setMapSize, setIsExpanded]);

    const handleResize = useCallback((shouldExpand) => {
        if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
        }

        resizeTimeoutRef.current = setTimeout(() => {
            if (shouldExpand !== isExpanded) {
                animateResize(shouldExpand ? 400 : 800, shouldExpand ? 800 : 400, mapInstanceRef, 300);
            }
        }, 100);
    }, [animateResize, isExpanded]);

    const resetExpand = () => {
        setIsExpanded(false);
        handleResize(false);
    }


    useEffect(() => {
        initializeMap(mapRef.current, mapInstanceRef);
        setTargetPosition(targetPosition);
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
        };
    }, [initializeMap, targetPosition, imageUrl, imageWidth, imageHeight]);

    return {
        mapRef,
        mapSize,
        fullscreenMapRef,
        mapInstanceRef,
        fullscreenMapInstanceRef,
        handleMapClick,
        isFullScreen,
        isPortrait,
        isExpanded,
        setIsFullScreen,
        userPosition,
        setUserPosition,
        initializeMap,
        cleanupMap,
        handleResize,
        handleChooseClick,
        handleNextClick
    };
};

export default useMapLogic;
