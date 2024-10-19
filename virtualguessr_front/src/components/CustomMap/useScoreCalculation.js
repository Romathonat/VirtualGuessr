// useScoreCalculation.js
import { useState, useCallback } from 'react';
import { useGameContext } from '../../contexts/GameContext';

const useScoreCalculation = (imageWidth, imageHeight) => {
    const { score, setScore } = useGameContext();

    const calculateScore = useCallback((userPosition, targetPosition) => {
        const distance = computeDistance(userPosition, targetPosition);
        const newScore = computeScore(distance, imageWidth, imageHeight);
        setScore(newScore);
    }, [imageWidth, imageHeight]);

    return { score, calculateScore };
};

const computeDistance = (point1, point2) => {
    const dx = point1.lng - point2.x;
    const dy = point1.lat - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
};

const computeScore = (distance, imageWidth, imageHeight) => {
    const maxScore = 5000;
    const maxDistance = Math.sqrt(imageWidth * imageWidth + imageHeight * imageHeight);
    const normalizedDistance = distance / maxDistance;
    const score = maxScore * Math.exp(-5 * normalizedDistance);
    return Math.round(score);
};


export default useScoreCalculation;
