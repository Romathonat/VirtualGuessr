import { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../contexts/GameContext';

const useGameLogic = (panoramas, cleanupMap) => {
    const {
        globalScore,
        showResult,
        isPortrait,
        setIsPortrait,
        currentIndex,
        setCurrentIndex,
        setPanoramas,
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
        setPanoramas(panoramas);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
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
        setIsPortrait,
        currentIndex,
        setCurrentIndex,
    };
};

export default useGameLogic;
