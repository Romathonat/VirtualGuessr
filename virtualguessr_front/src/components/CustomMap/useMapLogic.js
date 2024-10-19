import { useRef, useState, useCallback, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './CustomShovelIcon.module.css';
import { useGameContext } from '../../contexts/GameContext';


const useMapLogic = (imageUrl, targetPosition, imageWidth, imageHeight) => {
    const mapRef = useRef(null);
    const fullscreenMapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const fullscreenMapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const {
        userPosition,
        setUserPosition,
        isFullScreen,
        setIsFullScreen,
        setTargetPosition
    } = useGameContext();

    const calculateMinZoom = useCallback(() => {
        const maxMapSize = Math.max(800, 400);
        return -Math.log(imageWidth / maxMapSize) / Math.log(2);
    }, [imageWidth]);

    const cleanupMap = useCallback((map) => {

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
    }, []);


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
        map.fitBounds(bounds);

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
    }, [initializeMap]);

    return {
        mapRef,
        fullscreenMapRef,
        mapInstanceRef,
        fullscreenMapInstanceRef,
        handleMapClick,
        isFullScreen,
        setIsFullScreen,
        userPosition,
        setUserPosition,
        initializeMap,
        cleanupMap
    };
};

export default useMapLogic;
