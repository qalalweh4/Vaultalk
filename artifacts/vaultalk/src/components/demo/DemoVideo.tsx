import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";

const SCENE_DURATIONS = [3500, 4000, 5000, 6500, 4000, 4000];

export default function DemoVideo() {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    let idx = 0;
    function advance() {
      const duration = SCENE_DURATIONS[idx];
      const t = setTimeout(() => {
        idx = (idx + 1) % SCENE_DURATIONS.length;
        setCurrentScene(idx);
        advance();
      }, duration);
      return t;
    }
    const t = advance();
    return () => clearTimeout(t);
  }, []);

  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0d0a1e]">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-[60vw] h-[60vw] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
          animate={{ x: ["-10vw", "50vw", "10vw"], y: ["-10vh", "40vh", "-20vh"], scale: [1, 1.2, 0.8] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[50vw] h-[50vw] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }}
          animate={{ x: ["50vw", "-10vw", "40vw"], y: ["40vh", "-20vh", "10vh"], scale: [0.8, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Scene renderer */}
      <AnimatePresence mode="popLayout">
        {scenes.map((SceneComponent, i) =>
          currentScene === i ? <SceneComponent key={`scene-${i}`} /> : null
        )}
      </AnimatePresence>
    </div>
  );
}
