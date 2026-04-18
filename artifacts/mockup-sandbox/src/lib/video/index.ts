import { useState, useEffect } from 'react';

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneKeys = Object.keys(durations);

  useEffect(() => {
    window.startRecording?.();
    let isFirstPass = true;
    let currentIdx = 0;
    
    const advanceScene = () => {
      const duration = durations[sceneKeys[currentIdx]];
      setTimeout(() => {
        currentIdx = (currentIdx + 1) % sceneKeys.length;
        setCurrentScene(currentIdx);
        
        if (currentIdx === 0 && isFirstPass) {
          isFirstPass = false;
          window.stopRecording?.();
        }
        
        advanceScene();
      }, duration);
    };
    
    advanceScene();
  }, []);

  return { currentScene };
}
