import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import * as THREE from 'three';
import { inSphere } from 'maath/random';

// --- Helper Components ---

interface StarfieldProps {
    isRevealed: boolean;
}

const Starfield: React.FC<StarfieldProps> = ({ isRevealed }) => {  
  const pointsRef = useRef<any>(null!);
  const [sphere] = useState(() => inSphere(new Float32Array(15000), { radius: 5 }));

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x -= delta / 20;
      pointsRef.current.rotation.y -= delta / 30;
      const targetScale = isRevealed ? 1.5 : 1;
      pointsRef.current.scale.x = THREE.MathUtils.lerp(pointsRef.current.scale.x, targetScale, 0.05);
      pointsRef.current.scale.y = THREE.MathUtils.lerp(pointsRef.current.scale.y, targetScale, 0.05);
      pointsRef.current.scale.z = THREE.MathUtils.lerp(pointsRef.current.scale.z, targetScale, 0.05);
    }
  });

  return (
    <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ff4444"
        size={0.01}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

const Confetti: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null!);
    const [positions, colors] = React.useMemo(() => {
        const numPoints = 500;
        const pos = inSphere(new Float32Array(numPoints * 3), { radius: 1 });
        const col = new Float32Array(numPoints * 3);
        const colorChoices = [new THREE.Color('#FFD700'), new THREE.Color('#FF0000'), new THREE.Color('#8B0000')];
        for (let i = 0; i < numPoints; i++) {
            const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
            col[i * 3] = color.r;
            col[i * 3 + 1] = color.g;
            col[i * 3 + 2] = color.b;
        }
        return [pos, col];
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            pointsRef.current.scale.x += delta * 2;
            pointsRef.current.scale.y += delta * 2;
            pointsRef.current.scale.z += delta * 2;
            (pointsRef.current.material as THREE.PointsMaterial).opacity = THREE.MathUtils.lerp((pointsRef.current.material as THREE.PointsMaterial).opacity, 0, 0.02);
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="color" count={colors.length / 3} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                transparent
                size={0.05}
                sizeAttenuation
                depthWrite={false}
                vertexColors
            />
        </points>
    );
};


const Effects: React.FC = () => {
    return (
        <EffectComposer>
            <Bloom luminanceThreshold={0.1} intensity={1.2} mipmapBlur />
        </EffectComposer>
    );
}

const AnimatedTitle: React.FC<{ text: string; isVisible: boolean }> = ({ text, isVisible }) => {
    const titleVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };

    const letterVariants: Variants = {
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        visible: { 
            opacity: 1, 
            y: 0, 
            filter: 'blur(0px)',
            transition: { type: 'spring', damping: 12, stiffness: 100 },
        },
    };

    return (
        <motion.h1
            className="text-5xl md:text-8xl font-bold tracking-widest text-center pointer-events-none"
            style={{
                textShadow: `
                    0 0 5px rgba(255, 255, 255, 0.8),
                    0 0 10px rgba(255, 0, 0, 0.8),
                    0 0 20px rgba(255, 0, 0, 0.6),
                    0 0 40px rgba(255, 0, 0, 0.6),
                    0 0 70px rgba(255, 0, 0, 0.4)
                `
            }}
            variants={titleVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            aria-label={text}
        >
            {text.split('').map((char, index) => (
                <motion.span key={index} variants={letterVariants} className="inline-block">
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.h1>
    );
};

const DecryptingText: React.FC = () => {
    const [text, setText] = useState('');
    const chars = '█▓▒░ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?@#$%^&*()_+-=[]{}|;:<>,./';
    const targetText = "THE ENCRYPTED TRUTH";

    useEffect(() => {
        let interval: number;
        const updateText = () => {
            let randomString = '';
            for (let i = 0; i < targetText.length; i++) {
                randomString += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            setText(randomString);
        };
        interval = window.setInterval(updateText, 60);
        return () => clearInterval(interval);
    }, [targetText.length, chars]);

    return (
        <motion.div
            className="text-4xl md:text-6xl font-mono text-center tracking-widest"
            style={{
                color: '#ff0000',
                textShadow: '0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #ff0000'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.7, 1], transition: { duration: 0.2, repeat: Infinity } }}
            exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.5, transition: { duration: 1 } }}
        >
            {text}
        </motion.div>
    );
};

const LandingHeader: React.FC = () => (
    <motion.div
        key="landing-header"
        className="text-center mb-8 md:mb-12"
        exit={{ opacity: 0, y: -50, transition: { duration: 1 } }}
    >
        <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-wider"
            style={{
                textShadow: `
                    0 0 5px rgba(255, 255, 255, 0.7),
                    0 0 10px rgba(255, 0, 0, 0.7),
                    0 0 20px rgba(255, 0, 0, 0.5)
                `
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 2, ease: "easeOut" } }}
        >
           👉 SALUS: WELCOME TO THE CRIME SCENE
        </motion.h1>
        <motion.p
            className="mt-4 text-xl md:text-2xl text-red-400 tracking-wider font-mono"
            style={{ textShadow: '0 0 8px rgba(255, 0, 0, 0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.7, 0.8], transition: { delay: 1, duration: 4, repeat: Infinity, repeatType: "mirror" } }}
        >
            Every clue hides a lie.
        </motion.p>
    </motion.div>
);

const ImagePlaceholder: React.FC = () => (
    <motion.div
      key="image-placeholder"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1, duration: 2, ease: [0.16, 1, 0.3, 1] }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', transition: { duration: 1 } }}
    >
      <motion.div
        // Added mx-auto to center horizontally
        className="w-4/5 max-w-4xl mx-auto aspect-square p-2 rounded-3xl bg-black/30 backdrop-blur-xl border border-red-500/40 shadow-[0_0_50px_10px_rgba(255,0,0,0.25)]"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      >
        <img
          src="https://i.postimg.cc/c1cLDjjJ/image.png"
          alt="Mysterious asset placeholder"
          className="w-full h-full object-cover rounded-2xl border border-black/50"
        />
      </motion.div>
    </motion.div>
);


// --- Main App Component ---

export default function App() {
  const [stage, setStage] = useState<'landing' | 'decrypting' | 'revealing'>('landing');
  const audioRef = useRef<HTMLAudioElement>(null);
  const isRevealed = stage === 'revealing';

  // Attempt to autoplay audio on mount with a smooth fade-in
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
        audio.volume = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Autoplay started, fade in volume
                let currentVolume = 0;
                const targetVolume = 0.3;
                const fadeDuration = 3000; // 3 seconds
                const steps = 30;
                const stepTime = fadeDuration / steps;
                const volumeIncrement = targetVolume / steps;

                const fadeInInterval = setInterval(() => {
                    currentVolume += volumeIncrement;
                    if (currentVolume >= targetVolume) {
                        audio.volume = targetVolume;
                        clearInterval(fadeInInterval);
                    } else {
                        audio.volume = currentVolume;
                    }
                }, stepTime);
            }).catch(error => {
                console.warn("Audio autoplay was prevented. Music will start on user interaction.");
            });
        }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && stage === 'landing') {
            setStage('decrypting');
            // Fallback for browsers that block autoplay: play on first interaction
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.volume = 0.3;
                audioRef.current.play().catch(error => console.log("Audio play on interaction failed:", error));
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stage]);
  
  useEffect(() => {
    if (stage === 'decrypting') {
        const timer = setTimeout(() => {
            setStage('revealing');
        }, 10000); // 10-second decryption phase
        return () => clearTimeout(timer);
    }
  }, [stage]);


  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden cursor-pointer">
        <audio ref={audioRef} src="https://raw.githubusercontent.com/hx010207/music-for-event/main/mixkit-fright-night-871.mp3" loop />
        
        <motion.div 
            className="absolute inset-0 w-full h-full"
            animate={{
                background: isRevealed 
                    ? 'radial-gradient(circle at center, rgba(40,0,0,1) 0%, rgba(10,0,0,1) 30%, #000 70%)'
                    : 'radial-gradient(circle at center, rgba(20,0,0,1) 0%, #000 70%)'
            }}
            transition={{ duration: 5 }}
        />

        <div className="absolute inset-0 w-full h-full z-0">
            <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
                <ambientLight intensity={0.2} />
                <hemisphereLight groundColor="black" color="#440000" intensity={1} />
                <Suspense fallback={null}>
                    <Starfield isRevealed={isRevealed} />
                    {isRevealed && <Confetti />}
                    <Effects />
                </Suspense>
            </Canvas>
        </div>
        
        <div className="absolute inset-0 z-10 flex min-h-screen w-full flex-col items-center justify-center p-4 pointer-events-none">
            <AnimatePresence mode="wait">
                {stage === 'landing' && (
                    <>
                        <LandingHeader key="header" />
                        <ImagePlaceholder key="placeholder" />
                    </>
                )}
                {stage === 'decrypting' && <DecryptingText key="decrypting" />}
                {stage === 'revealing' && (
                    <motion.div 
                        key="revealing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 1, duration: 2 } }}
                        className="flex flex-col items-center"
                    >
                        <AnimatedTitle text="THE ENCRYPTED TRUTH" isVisible={isRevealed} />
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.8, y: 0, transition: { delay: 2.5, duration: 1.5 } }}
                            className="mt-6 text-lg md:text-2xl text-red-300 tracking-wider"
                        >
                            The Secrets Await to be Unlocked
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </main>
  );
}
