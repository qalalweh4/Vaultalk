import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { SceneUI } from './video_scenes/SceneUI';
import { Scene4 } from './video_scenes/Scene4';
import { SceneKey } from './video_scenes/SceneKey';
import { Scene5 } from './video_scenes/Scene5';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';
import { Scene9 } from './video_scenes/Scene9';
import { Scene6 } from './video_scenes/Scene6';

const SCENE_DURATIONS = {
  scene1:   3500,  // Brand open
  scene2:   4000,  // The Problem
  scene3:   5000,  // Negotiation + Claude AI
  sceneUI:  9000,  // Real UI split-screen demo
  scene4:   6500,  // Highly Encrypted Files
  sceneKey: 5500,  // Invoice ID = decryption key
  scene5:   4000,  // No disputes / trust
  scene7:   5000,  // Business Model
  scene8:   5000,  // Market Segments
  scene9:   5000,  // Monetization
  scene6:   4000,  // Outro
};

const SCENES = [Scene1, Scene2, Scene3, SceneUI, Scene4, SceneKey, Scene5, Scene7, Scene8, Scene9, Scene6];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0d0a1e]">
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

      <AnimatePresence>
        {SCENES.map((SceneComponent, i) =>
          currentScene === i ? (
            <motion.div
              key={`scene-${i}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
              <SceneComponent />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}
