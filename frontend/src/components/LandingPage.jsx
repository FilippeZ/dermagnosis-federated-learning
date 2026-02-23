import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = ({ onEnter }) => {
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const totalFrames = 60;
    const canvasRef = useRef(null);
    const imagesRef = useRef([]);
    const requestRef = useRef();

    // The frames are named like "grok-video-1437744d-e742-49f9-b06e-240d7aa4ead4 (1)_000.jpg" to "..._059.jpg"
    useEffect(() => {
        const preloadImages = async () => {
            const loadedImages = [];
            let loadedCount = 0;

            for (let i = 0; i < totalFrames; i++) {
                const img = new Image();
                // Format the number to be 3 digits
                const numStr = i.toString().padStart(3, '0');
                const src = `/back/grok-video-1437744d-e742-49f9-b06e-240d7aa4ead4 (1)_${numStr}.jpg`;

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
                    // Ensure we still progress even if an image fails to load
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
        const fps = 12; // Slightly faster for responsiveness
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

            // Add a "Digital Analysis" filter effect
            ctx.filter = 'contrast(1.2) brightness(0.9)';

            // Apply a dark overlay directly on the canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw a digital grid
            ctx.strokeStyle = 'rgba(6, 249, 249, 0.08)';
            ctx.lineWidth = 1;
            const step = 60;
            for (let i = 0; i < canvas.width; i += step) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            }
            for (let j = 0; j < canvas.height; j += step) {
                ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
            }

            // Draw a horizontal scanning line
            const scanY = (Date.now() / 20) % canvas.height;
            ctx.strokeStyle = 'rgba(6, 249, 249, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(canvas.width, scanY); ctx.stroke();

            // Draw random "scanning" points / data markers
            ctx.fillStyle = 'rgba(6, 249, 249, 1)';
            for (let k = 0; k < 3; k++) {
                const px = Math.random() * canvas.width;
                const py = Math.random() * canvas.height;
                ctx.fillRect(px, py, 15, 2);
                ctx.font = '8px monospace';
                ctx.fillText(`ANLZ_${Math.floor(Math.random() * 999)}`, px + 20, py + 5);
            }
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
        handleResize(); // Initial call

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-display flex items-center justify-center">
            {/* Background Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 h-full w-full"
                style={{
                    filter: isLoaded ? 'none' : 'blur(20px)',
                    transition: 'filter 1s ease-in-out'
                }}
            />

            {/* Loading State Overlay */}
            <AnimatePresence>
                {!isLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
                    >
                        <div className="relative group flex-shrink-0 mb-8">
                            <motion.div
                                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                            />
                            <img
                                src="/assets/logoo.png"
                                alt="DermaGnosis Logo"
                                className="size-24 object-contain relative z-10 filter contrast-125 brightness-110"
                            />
                        </div>
                        <div className="w-64 bg-slate-800 h-1 rounded-full overflow-hidden mb-4">
                            <motion.div
                                className="bg-primary h-full shadow-[0_0_10px_#06f9f9]"
                                style={{ width: `${(imagesLoaded / totalFrames) * 100}%` }}
                                layout
                            />
                        </div>
                        <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
                            Initializing Core Engine [{imagesLoaded}/{totalFrames}]
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Overlay */}
            <AnimatePresence>
                {isLoaded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="relative z-10 flex flex-col items-center text-center max-w-4xl px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="relative group mb-8"
                        >
                            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full mix-blend-screen pointer-events-none" />
                            <img
                                src="/assets/logoo.png"
                                alt="DermaGnosis Logo"
                                className="size-48 sm:size-64 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(0,242,254,0.3)] filter contrast-125 brightness-110"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1 }}
                            className="text-5xl sm:text-7xl font-black text-white tracking-[0.15em] uppercase mb-4 drop-shadow-2xl"
                        >
                            DermaGnosis
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1.2 }}
                            className="text-primary tracking-[0.4em] uppercase font-bold text-sm sm:text-base mb-12 drop-shadow-md"
                        >
                            Global Clinical Intelligence Hub
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,242,254,0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.5, delay: 1.5 }}
                            onClick={onEnter}
                            className="group relative overflow-hidden rounded-full glass-panel border border-primary/40 bg-black/40 px-10 py-4 backdrop-blur-md transition-all"
                        >
                            <span className="absolute inset-0 w-0 bg-primary/20 transition-all duration-[250ms] ease-out group-hover:w-full"></span>
                            <div className="relative flex items-center gap-3">
                                <span className="font-bold uppercase tracking-[0.2em] text-white">Initialize System</span>
                                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                                    arrow_forward_ios
                                </span>
                            </div>
                        </motion.button>

                        {/* Decorative UI Elements */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-3xl"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/30 rounded-tr-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/30 rounded-bl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/30 rounded-br-3xl"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanline overlay for that tech feel */}
            <div className="scanline z-20 pointer-events-none opacity-50"></div>
        </div>
    );
};

export default LandingPage;
