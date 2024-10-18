import React, { useEffect } from 'react';
import ScoreDisplay from './ScoreDisplay';

const FullscreenMap = ({ fullscreenMapRef, fullscreenMapInstanceRef, score, handleNextClick, initializeMap}) => {
    useEffect(() => {
        const map = initializeMap(fullscreenMapRef.current, fullscreenMapInstanceRef);
        
        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [initializeMap, fullscreenMapRef, fullscreenMapInstanceRef]);

    return (
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
                <ScoreDisplay score={score} />
            </div>
        </div>
    );
};

export default FullscreenMap;