import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = ({ onEnter }) => {
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const totalFrames = 44;
    const canvasRef = useRef(null);
    const imagesRef = useRef([]);
    const requestRef = useRef();

    // The frames are named like "Video Project 2_000.jpg" to "Video Project 2_043.jpg"
    useEffect(() => {
        const preloadImages = async () => {
            const loadedImages = [];
            let loadedCount = 0;

            for (let i = 0; i < totalFrames; i++) {
                const img = new Image();
                const numStr = i.toString().padStart(3, '0');
                const src = `/Video_Project_2_000/Video Project 2_${numStr}.jpg`;

                img.src = src;
                img.onload = () => {
                    loadedCount++;
                    setImagesLoaded(loadedCount);
                    if (loadedCount === totalFrames) {
                        setIsLoaded(true);
                    }
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${src}`);
                    loadedCount++;
                    setImagesLoaded(loadedCount);
                    if (loadedCount === totalFrames) {
                        setIsLoaded(true);
                    }
                }
                loadedImages.push(img);
            }
            imagesRef.current = loadedImages;
        };

        preloadImages();
    }, []);

    // Animation Loop
    useEffect(() => {
        if (!isLoaded || imagesRef.current.length === 0) return;

        let lastTime = 0;
        const fps = 8; // Slightly slower for smoother cinematic playback
        const interval = 1000 / fps;

        const animate = (time) => {
            if (time - lastTime >= interval) {
                lastTime = time;
                setCurrentFrame((prev) => (prev + 1) % totalFrames);
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isLoaded]);

    // Draw to canvas when frame changes
    useEffect(() => {
        if (!isLoaded || !canvasRef.current || imagesRef.current.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = imagesRef.current[currentFrame];

        if (img && img.complete && img.naturalWidth !== 0) {
            // Calculate scale to cover the canvas (like object-fit: cover)
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;

            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // Sleek cinematic gradient dark overlay
            ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [currentFrame, isLoaded]);

    // Handle Window Resize for Canvas
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div onClick={onEnter} className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-display flex items-center justify-center cursor-pointer">
            {/* Background Canvas Video */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 h-full w-full object-cover"
                style={{
                    filter: isLoaded ? 'none' : 'blur(20px)',
                    transition: 'filter 1s ease-in-out'
                }}
            />

            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 pointer-events-none z-1" />

            {/* Loading State Overlay */}
            <AnimatePresence>
                {!isLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
                    >
                        <div className="w-64 bg-slate-800/60 backdrop-blur-md h-1.5 rounded-full overflow-hidden mb-4 border border-white/10">
                            <motion.div
                                className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full shadow-[0_0_15px_#06b6d4]"
                                style={{ width: `${(imagesLoaded / totalFrames) * 100}%` }}
                                layout
                            />
                        </div>
                        <p className="text-cyan-400 font-mono text-xs tracking-[0.25em] uppercase">
                            Loading Platform [{imagesLoaded}/{totalFrames}]
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-5xl px-6">
                {/* Main Logo & Tech Badge */}
                <div className="mb-6 flex flex-col items-center justify-center">
                    <img
                        src="/logo.jpeg"
                        alt="DermaGnosis Logo"
                        className="h-28 sm:h-36 object-contain rounded-2xl drop-shadow-[0_0_35px_rgba(6,182,212,0.6)] mb-4 border-2 border-cyan-400/30 shadow-2xl"
                    />
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-semibold uppercase tracking-[0.3em] backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                        </span>
                        Clinical Intelligence &amp; Federated XAI
                    </div>
                </div>

                {/* Clear Title */}
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-[0.08em] text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] mb-6">
                    DermaGnosis
                </h1>

                {/* Clear Subtitle */}
                <div className="relative max-w-3xl mb-12">
                    <p className="text-cyan-100 tracking-[0.3em] uppercase font-bold text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-lg">
                        Privacy-Preserving Federated Diagnostics &amp; Explainable AI
                    </p>
                    <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-4 mx-auto w-3/4" />
                </div>

                {/* Sleek CTA Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onEnter === 'function') onEnter();
                    }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 p-[2px] shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-105 cursor-pointer z-50 pointer-events-auto"
                >
                    <div className="flex items-center gap-4 rounded-[14px] bg-slate-950 px-10 py-4 backdrop-blur-2xl transition-all duration-300 group-hover:bg-slate-900 pointer-events-auto">
                        <span className="font-bold uppercase tracking-[0.25em] text-white text-sm">Enter Command Center</span>
                        <span className="material-symbols-outlined text-cyan-300 group-hover:translate-x-1.5 transition-transform duration-300 text-xl">
                            arrow_forward
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
