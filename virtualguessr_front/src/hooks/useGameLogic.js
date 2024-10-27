import { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../contexts/GameContext';

const useGameLogic = () => {
    const {
        panoramas,  
        setPanoramas,
        globalScore,
        showResult,
        isPortrait,
        isFullScreen,
        setIsPortrait,
        currentIndex,
        setCurrentIndex,
    } = useGameContext();

    const [showNewsletterForm, setShowNewsletterForm] = useState(false);
    const [hfov, setHfov] = useState(window.innerWidth / 13762 * 360);
    const [vaov, setVaov] = useState(window.innerHeight / 1306 * 41.7);


    const timeoutRef = useRef(null);
    const pannellumRef = useRef(null);
    const containerRef = useRef(null);

    const handleResize = () => {
        const newIsPortrait = window.innerHeight > window.innerWidth;
        setIsPortrait(newIsPortrait);
        setHfov(window.innerWidth / 13762 * 360);
        const baseVaov = window.innerHeight / 1306 * 41.7;
        setVaov(newIsPortrait ? baseVaov * 2 : baseVaov);


        if (pannellumRef.current) {
            pannellumRef.current.setHfov(window.innerWidth / 13762 * 360);
        }
    };


    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        panoramas,
        setPanoramas,
        showNewsletterForm,
        setShowNewsletterForm,
        hfov,
        setHfov,
        vaov,
        setVaov,
        timeoutRef,
        pannellumRef,
        containerRef,
        globalScore,
        showResult,
        isPortrait,
        isFullScreen,
        setIsPortrait,
        currentIndex,
        setCurrentIndex,
    };
};

export default useGameLogic;
