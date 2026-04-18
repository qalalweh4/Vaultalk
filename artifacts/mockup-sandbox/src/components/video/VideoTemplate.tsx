import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';

const SCENE_DURATIONS = { 
  scene1: 3500, 
  scene2: 4000, 
  scene3: 5000, 
  scene4: 5000, 
  scene5: 4000,
  scene6: 4000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0d0a1e]">
      {/* Background */}
      <div className="absolute inset-0">
        <motion.div className="absolute w-[60vw] h-[60vw] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
          animate={{ x: ['-10vw', '50vw', '10vw'], y: ['-10vh', '40vh', '-20vh'], scale: [1, 1.2, 0.8] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[50vw] h-[50vw] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }}
          animate={{ x: ['50vw', '-10vw', '40vw'], y: ['40vh', '-20vh', '10vh'], scale: [0.8, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* Foreground */}
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="scene1" />}
        {currentScene === 1 && <Scene2 key="scene2" />}
        {currentScene === 2 && <Scene3 key="scene3" />}
        {currentScene === 3 && <Scene4 key="scene4" />}
        {currentScene === 4 && <Scene5 key="scene5" />}
        {currentScene === 5 && <Scene6 key="scene6" />}
      </AnimatePresence>
    </div>
  );
}
