import { useState, useCallback, useRef } from 'react';

const useMapResize = (mapInstanceRef) => {
    const [mapSize, setMapSize] = useState(400);
    const [isExpanded, setIsExpanded] = useState(false);
    const resizeTimeoutRef = useRef(null);

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
    }, []);

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

    return { mapSize, isExpanded, handleResize, resetExpand };
};

export default useMapResize;