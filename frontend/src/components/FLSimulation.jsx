import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CONFIG } from '../config';

const FLSimulation = () => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        nodes: 42,
        samples: '1.24M',
        accuracy: 94.2,
        budget: 0.051,
        cycle: 14,
        progress: 100
    });

    const [logs, setLogs] = useState([
        { time: '14:02:11', msg: 'System: Init weight aggregation cycle #14', type: 'primary' },
        { time: '14:02:15', msg: 'Integrity: Check passed (42/42 nodes)', type: 'success' },
    ]);

    const runSimulation = async () => {
        setIsSimulating(true);
        setError(null);
        setLogs(prev => [...prev, {
            time: new Date().toLocaleTimeString([], { hour12: false }),
            msg: "CORE: Initializing dynamic aggregation protocols...",
            type: "primary"
        }]);

        try {
            const response = await axios.get(`${CONFIG.API_BASE}/simulation/fl?rounds=8`);
            if (response.data.success) {
                const results = response.data.history;
                setHistory(results);

                // Sequential log updates for visual impact
                results.forEach((round, i) => {
                    setTimeout(() => {
                        setLogs(prev => [
                            ...prev,
                            {
                                time: new Date().toLocaleTimeString([], { hour12: false }),
                                msg: `SYNC_R${round.round}: Global Accuracy optimized to ${(round.accuracy * 100).toFixed(2)}%`,
                                type: "success"
                            }
                        ]);
                        if (i === results.length - 1) {
                            setStats(prev => ({
                                ...prev,
                                accuracy: (round.accuracy * 100).toFixed(1),
                                cycle: round.round
                            }));
                            setIsSimulating(false);
                        }
                    }, i * 800);
                });
            }
        } catch (err) {
            console.error("Simulation failed", err);
            setError("Simulation Hub Offline");
            setLogs(prev => [...prev, {
                time: new Date().toLocaleTimeString([], { hour12: false }),
                msg: "CRITICAL: Connection to Peer-to-Peer Hub Lost.",
                type: "error"
            }]);
            setIsSimulating(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
            className="flex flex-col min-h-full gap-8 p-10 bg-slate-950/30 relative"
        >
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black uppercase tracking-[0.25em] text-slate-100">
                        Federated <span className="text-primary glow-primary italic">Learning</span> Mesh
                    </h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <span className={`size-1.5 rounded-full ${isSimulating ? 'bg-primary animate-ping' : 'bg-emerald-500'}`}></span>
                        Secure Distributed Intelligence // Peer-to-Peer Hub
                    </p>
                </div>
                <div className="flex gap-4">
                    {error && (
                        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] text-red-400 font-black uppercase tracking-widest animate-pulse">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="btn-action px-8 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale shadow-xl shadow-primary/20"
                    >
                        {isSimulating ? 'Synchronizing Nodes...' : 'Execute Migration'}
                    </button>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden gap-8">
                {/* Center Panel: Topology Visualization */}
                <section className="flex-1 flex flex-col glass-panel rounded-[2.5rem] relative overflow-hidden border-white/10 mesh-grid">
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]"></div>
                        {/* Simulation Streams */}
                        {isSimulating && (
                            <div className="absolute inset-0 z-0">
                                <div className="absolute top-1/4 left-1/4 w-[400px] h-[1px] bg-primary/20 rotate-45 data-stream"></div>
                                <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[1px] bg-primary/20 -rotate-12 data-stream" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-3/4 left-1/2 w-[500px] h-[1px] bg-primary/20 rotate-[160deg] data-stream" style={{ animationDelay: '2.5s' }}></div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 relative flex items-center justify-center">
                        {/* Central Aggregator Node */}
                        <div className="relative z-10">
                            <motion.div
                                animate={isSimulating ? { scale: [1, 1.05, 1], rotate: 360 } : { scale: [1, 1.02, 1] }}
                                transition={{ duration: isSimulating ? 5 : 15, repeat: Infinity, ease: "linear" }}
                                className="size-64 rounded-full border border-white/10 bg-black/40 flex items-center justify-center relative backdrop-blur-3xl shadow-[0_0_80px_rgba(0,242,254,0.05)]"
                            >
                                <div className="size-48 rounded-full border-2 border-primary/20 flex items-center justify-center">
                                    <div className="size-32 bg-primary/10 rounded-full flex items-center justify-center border border-primary/40 shadow-inner">
                                        <span className={`material-symbols-outlined text-primary text-6xl font-light ${isSimulating ? 'animate-pulse' : ''}`}>
                                            {isSimulating ? 'hub' : 'cloud_done'}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 bg-slate-900/90 border border-primary/40 px-6 py-2 rounded-full text-[10px] font-black text-primary tracking-[0.2em] shadow-2xl backdrop-blur-md">
                                    CORE_AGGREGATOR_L8
                                </div>
                            </motion.div>

                            {/* Orbiting Elements */}
                            <svg className="absolute inset-0 -z-10 w-[1000px] h-[1000px] -translate-x-[20%] -translate-y-[20%] pointer-events-none">
                                <circle cx="500" cy="500" r="300" stroke="rgba(0,242,254,0.05)" strokeWidth="1" fill="none" />
                                <circle cx="500" cy="500" r="400" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" />
                            </svg>
                        </div>

                        {/* Edge Clinical Nodes */}
                        {[
                            { pos: 'top-12 left-24', name: 'Mayo Clinic', id: 'N-01', cap: '240k' },
                            { pos: 'top-32 right-32', name: 'Charité Berlin', id: 'N-02', cap: '310k' },
                            { pos: 'bottom-24 left-48', name: 'Stanford Med', id: 'N-03', cap: '185k' },
                            { pos: 'bottom-40 right-24', name: 'Seoul Nat', id: 'N-04', cap: '420k' }
                        ].map((node, i) => (
                            <motion.div
                                key={node.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.15 }}
                                className={`absolute ${node.pos} group z-20 flex flex-col items-center gap-3`}
                            >
                                <div className={`size-4 rounded-full shadow-lg transition-all duration-500 cursor-pointer group-hover:scale-150 ${isSimulating ? 'bg-primary animate-ping shadow-primary' : 'bg-primary/60 shadow-primary/20'}`}></div>
                                <div className="px-3 py-1 glass-panel border-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[9px] font-black text-slate-100 uppercase tracking-widest">{node.name}</p>
                                    <p className="text-[8px] text-primary font-bold text-center mt-0.5">{node.cap} SAMPLES</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Telemetry HUD */}
                    <div className="p-10 bg-white/5 border-t border-white/5 relative z-30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Federated Volume', val: stats.samples, desc: 'Across 42 Clusters', color: 'text-primary' },
                                { label: 'Global Accuracy', val: `${stats.accuracy}%`, desc: 'Optimized Weight Set', color: 'text-emerald-400' },
                                { label: 'Privacy Budget', val: stats.budget, desc: '𝜖-Differential Noise', color: 'text-amber-400' },
                                { label: 'Sync Cycle', val: `#${stats.cycle}`, desc: 'Next Rebalance: 4h', color: 'text-primary' }
                            ].map((stat) => (
                                <div key={stat.label} className="space-y-2">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.val}</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">{stat.desc}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full opacity-40 ${stat.color.replace('text', 'bg')}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: isSimulating ? '100%' : '60%' }}
                                            transition={{ duration: 2, repeat: isSimulating ? Infinity : 0 }}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Left Sidebar: Node Health & Logs */}
                <aside className="w-[400px] flex flex-col gap-6">
                    {/* Real-time Logs */}
                    <div className="flex-[1.2] glass-panel rounded-[2.5rem] flex flex-col overflow-hidden border-white/10">
                        <header className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">database</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-100">Sync Pipeline Logs</span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase">Live_Stream</span>
                        </header>
                        <div className="flex-1 p-8 overflow-y-auto font-mono text-[11px] space-y-4 custom-scrollbar bg-black/20">
                            {logs.map((log, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex gap-4 ${log.type === 'primary' ? 'text-primary' :
                                        log.type === 'success' ? 'text-emerald-400' :
                                            log.type === 'error' ? 'text-red-400' : 'text-slate-500'
                                        }`}
                                >
                                    <span className="opacity-30 flex-shrink-0">[{log.time}]</span>
                                    <span className="leading-relaxed">{">> "} {log.msg}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Optimization Curve */}
                    <div className="flex-1 glass-panel rounded-[2.5rem] p-8 border-white/10 flex flex-col">
                        <header className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Optimization curve</span>
                            <span className="text-[9px] text-primary font-black uppercase tracking-tight">Rounds 1-8</span>
                        </header>
                        <div className="flex-1 flex items-end gap-2 px-2 pt-4">
                            {history.length > 0 ? (
                                history.map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="w-full relative">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h.accuracy * 120}px` }}
                                                className="w-full bg-primary/20 border border-primary/40 rounded-t-lg group-hover:bg-primary group-hover:border-primary transition-all cursor-help"
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                                    {(h.accuracy * 100).toFixed(1)}%
                                                </div>
                                            </motion.div>
                                        </div>
                                        <span className="text-[8px] font-black text-slate-600">R{h.round}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 border border-dashed border-white/5 rounded-2xl opacity-40">
                                    <span className="material-symbols-outlined text-4xl text-slate-600">query_stats</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Waiting for Cycle_</span>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </main>
        </motion.div>
    );
};

export default FLSimulation;
