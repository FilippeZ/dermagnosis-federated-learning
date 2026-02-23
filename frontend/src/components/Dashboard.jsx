import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CONFIG } from '../config';

const Dashboard = () => {
    const [stats, setStats] = useState({
        load: '70.2%',
        latency: '36ms',
        reliability: '94.13%',
        precision: 0.961,
        recall: 0.928,
        f1: 0.944,
        active_nodes: '1.249',
        mesh_coverage: '98.4%',
        persistence: '4 Subjs',
        last_checkpoint: 'V2.4 (Thr: 0.99)'
    });

    const [logs, setLogs] = useState([
        { time: '15:01:39', msg: 'TELEMETRY: SECURE: HSM Root Key rotated. New Key ID: SGX_9797_ROTATED', type: 'primary' },
        { time: '14:57:49', msg: 'TELEMETRY: Multi-cloud mesh health: OPTIMAL', type: 'success' },
        { time: '14:57:49', msg: 'TELEMETRY: Persistent SQLite Layer Initialized.', type: 'default' },
    ]);

    const [nodes, setNodes] = useState(Array.from({ length: 144 }, (_, i) => ({
        id: i,
        status: i % 8 === 0 ? 'Syncing (FL)' : i % 3 === 0 ? 'Standby' : 'Offline'
    })));

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${CONFIG.API_BASE}/stats/overview`);
                if (response.data.success) {
                    setStats(prev => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error("Dashboard stats fetch failed", error);
            }
        };

        const fetchNodes = async () => {
            try {
                const response = await axios.get(`${CONFIG.API_BASE}/telemetry/nodes`);
                if (response.data.success) {
                    setNodes(response.data.nodes);
                }
            } catch (error) {
                console.error("Dashboard nodes fetch failed", error);
            }
        };

        fetchStats();
        fetchNodes();
        const interval = setInterval(() => {
            fetchStats();
            fetchNodes();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0, filter: 'blur(20px)' },
        visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex-1 p-12 space-y-10 bg-slate-950/30 relative"
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-20">
                <div className="absolute top-[-10%] right-[-5%] size-[800px] bg-primary/10 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] size-[600px] bg-violet-600/10 rounded-full blur-[120px]"></div>
            </div>

            <header className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                    <h1 className="text-6xl font-black uppercase tracking-[0.3em] text-slate-100 leading-none drop-shadow-2xl">
                        Global Command <span className="text-primary glow-primary italic">HUD</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Neural Feed Telemetry
                            </p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-50">Version v2.4.0-STABLE</span>
                    </div>
                </div>

                <div className="flex gap-8">
                    {[
                        { label: 'System Load', val: stats.load, color: 'text-primary', glow: 'primary/20' },
                        { label: 'Latency', val: stats.latency, color: 'text-emerald-400', glow: 'emerald-400/20' }
                    ].map((m, i) => (
                        <div key={i} className="px-8 py-5 glass-panel rounded-3xl flex flex-col items-center min-w-[160px] border-white/5 bg-white/5 group hover:border-white/20 transition-all shadow-xl">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-300 transition-colors">{m.label}</span>
                            <span className={`text-3xl font-black ${m.color} tracking-tighter`}>{m.val}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Hero Section: Neural Context */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 relative z-10">
                <motion.div variants={itemVariants} className="lg:col-span-2 relative h-[420px] rounded-[4rem] border border-white/10 bg-slate-900/60 p-12 shadow-4xl overflow-hidden group">
                    <div className="absolute inset-0 z-0 scale-105 group-hover:scale-100 transition-transform duration-[2000ms]">
                        <motion.img
                            src="/assets/dashboard_hero.jpg"
                            alt="Neural Context"
                            className="w-full h-full object-cover opacity-40 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000"
                            initial={{ scale: 1.15, filter: 'brightness(0.8)' }}
                            animate={{ scale: 1.05, filter: 'brightness(1)' }}
                            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    </div>

                    <div className="flex flex-col justify-between h-full relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 rounded-2xl bg-primary/20 backdrop-blur-xl flex items-center justify-center border border-primary/40 shadow-lg">
                                        <span className="material-symbols-outlined text-primary text-2xl">biotech</span>
                                    </div>
                                    <span className="text-[12px] font-black text-primary uppercase tracking-[0.3em]">Neural Context Engine</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2 block">Model Reliability Index</span>
                                    <h2 className="text-9xl font-black text-slate-100 tracking-tighter leading-none">
                                        {stats.reliability.split('%')[0]}<span className="text-primary/50 font-light text-6xl">%</span>
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-16 border-t border-white/10 pt-10">
                            {[
                                { label: 'Precision', val: stats.precision },
                                { label: 'Recall', val: stats.recall },
                                { label: 'F1-Score', val: stats.f1 }
                            ].map(m => (
                                <div key={m.label} className="flex flex-col group/metric">
                                    <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-2 italic group-hover/metric:text-primary transition-colors">{m.label}</span>
                                    <span className="text-4xl font-black text-slate-100 tracking-tight leading-none">{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Secondary Stats */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-8">
                    <motion.div variants={itemVariants} className="glass-panel rounded-[3.5rem] p-10 flex flex-col justify-between group hover:border-primary/40 transition-all bg-slate-900/40 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Clinical Nodes</span>
                                <h3 className="text-6xl font-black text-slate-100 tracking-tighter italic">{stats.active_nodes}</h3>
                            </div>
                            <div className="size-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                            </div>
                        </div>
                        <div className="mt-10 space-y-6">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                                <span className="flex items-center gap-2 italic">Mesh Coverage <span className="size-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></span></span>
                                <span className="text-emerald-400 font-mono text-lg">{stats.mesh_coverage}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: stats.mesh_coverage }}
                                    transition={{ duration: 2.5, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-emerald-500/40 to-emerald-500 shadow-[0_0_25px_#10b981] rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-panel rounded-[3.5rem] p-10 flex flex-col justify-between group hover:border-violet-500/40 transition-all bg-slate-900/40 overflow-hidden relative">
                        <div className="absolute -top-10 -right-10 size-32 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors"></div>
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Clinical Persistence</span>
                                <h3 className="text-6xl font-black text-slate-100 tracking-tighter italic">{stats.persistence}</h3>
                            </div>
                            <div className="size-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                <span className="material-symbols-outlined text-violet-400 text-3xl">history</span>
                            </div>
                        </div>
                        <div className="mt-8 space-y-5">
                            <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 flex flex-col gap-3 relative overflow-hidden group/card hover:bg-black/60 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-4xl text-violet-400">hub</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.25em]">Global Intelligence Center</span>
                                <span className="text-[14px] text-slate-100 font-black italic tracking-wide">{stats.last_checkpoint}</span>
                            </div>
                            <button className="w-full px-8 py-4 rounded-[1.5rem] bg-violet-600/10 border border-violet-600/20 text-violet-400 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-violet-600 hover:text-white transition-all active:scale-[0.98] shadow-2xl shadow-violet-600/10">
                                Clear_Session_Logs
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Visual Analytics & Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                {/* Advanced Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel rounded-[4rem] p-12 relative overflow-hidden bg-slate-900/40 shadow-4xl group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <span className="material-symbols-outlined text-[15rem] text-primary">monitoring</span>
                    </div>
                    <header className="flex justify-between items-center mb-16 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="size-16 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-inner group-hover:animate-pulse">
                                <span className="material-symbols-outlined text-primary text-3xl">insights</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-100 uppercase tracking-[0.2em] leading-none">Convergence Analytics</h4>
                                <p className="text-[12px] text-slate-500 font-black uppercase tracking-[0.1em] mt-2 italic opacity-60">Neural Manifold Distribution</p>
                            </div>
                        </div>
                        <div className="flex gap-12 text-[11px] font-black uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-4 text-primary">
                                <div className="size-3 rounded-full bg-primary glow-primary animate-pulse shadow-[0_0_10px_var(--primary)]"></div> Train_Acc
                            </div>
                            <div className="flex items-center gap-4 text-slate-500">
                                <div className="size-3 rounded-full bg-slate-700"></div> Val_Loss
                            </div>
                        </div>
                    </header>
                    <div className="h-80 relative">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 3, ease: "circOut" }}
                                d="M0,180 C100,160 200,80 300,60 C400,40 500,55 600,40 C700,25 750,22 800,22"
                                fill="none"
                                stroke="url(#dash-grad)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_25px_rgba(6,249,249,0.5)]"
                            />
                            <defs>
                                <linearGradient id="dash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06f9f9" />
                                    <stop offset="100%" stopColor="#7c3aed" />
                                </linearGradient>
                            </defs>
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.15 }}
                                transition={{ duration: 3.5, delay: 0.5, ease: "circOut" }}
                                d="M0,20 C100,40 200,120 300,140 C400,160 500,145 600,160 C700,175 750,178 800,178"
                                fill="none"
                                stroke="#64748b"
                                strokeWidth="3"
                                strokeDasharray="12 8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </motion.div>

                {/* Telemetry Feed */}
                <motion.div variants={itemVariants} className="glass-panel rounded-[4rem] p-12 flex flex-col h-full overflow-hidden bg-slate-900/40 shadow-4xl group">
                    <header className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-2xl animate-spin-slow">radar</span>
                            </div>
                            <h4 className="text-[12px] font-black text-slate-100 uppercase tracking-[0.4em]">Neural Feed</h4>
                        </div>
                        <div className="flex items-center gap-4 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live_Secure</span>
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                    </header>
                    <div className="flex-1 bg-black/60 rounded-[2.5rem] border border-white/5 p-10 font-mono text-[11px] overflow-y-auto custom-scrollbar space-y-8 shadow-inner">
                        <AnimatePresence initial={false}>
                            {logs.map((log, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -30, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    key={`${log.time}-${i}`}
                                    className="flex gap-6 border-l-2 border-slate-800 pl-6 relative pb-2 group/log"
                                >
                                    <div className={`absolute -left-[7px] top-1.5 size-3 rounded-full ${log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-primary shadow-[0_0_10px_#06f9f9]'} scale-0 group-hover/log:scale-100 transition-transform`}></div>
                                    <span className="text-slate-600 flex-shrink-0 tabular-nums font-black pt-0.5 opacity-60">[{log.time}]</span>
                                    <span className={
                                        log.type === 'success' ? 'text-emerald-400 font-bold' :
                                            log.type === 'primary' ? 'text-primary font-bold' : 'text-slate-300'
                                    }>{log.msg}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Node Matrix Map */}
            <motion.div variants={itemVariants} className="glass-panel rounded-[4rem] p-12 relative overflow-hidden bg-slate-900/40 shadow-4xl group">
                <header className="flex justify-between items-end mb-16">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="size-16 rounded-[2rem] bg-slate-800/50 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-slate-500 group-hover:text-primary transition-colors">grid_view</span>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-100 uppercase tracking-[0.2em] leading-none">
                                    Clinical <span className="text-primary italic">Node Matrix</span> Distribution
                                </h4>
                                <p className="text-[13px] text-slate-500 font-black uppercase tracking-[0.1em] mt-3 opacity-60">Real-time status of 1.249 distributed Federated instances globally.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-12 text-[11px] font-black uppercase tracking-[0.3em] pb-2">
                        {[
                            { label: 'Syncing (FL)', color: 'bg-primary', glow: 'shadow-[0_0_12px_#06f9f9]' },
                            { label: 'Standby', color: 'bg-emerald-500/50', glow: '' },
                            { label: 'Offline', color: 'bg-slate-800', glow: '' }
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-4">
                                <div className={`size-3 rounded-full ${s.color} ${s.glow}`}></div>
                                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-12 md:grid-cols-24 gap-4 md:gap-5 lg:gap-6">
                    {nodes.map((node, i) => (
                        <motion.div
                            key={node.id}
                            whileHover={{
                                scale: 1.5,
                                zIndex: 10,
                                backgroundColor: node.status === 'Syncing (FL)' ? '#06f9f9' : 'rgba(255,255,255,1)',
                                boxShadow: node.status === 'Syncing (FL)' ? '0 0 35px #06f9f9' : '0 0 25px rgba(255,255,255,0.3)',
                                borderRadius: '1rem'
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.002, duration: 0.5 }}
                            className={`aspect-square rounded-2xl border-2 transition-all duration-700 relative cursor-crosshair group/node shadow-2xl ${node.status === 'Syncing (FL)' ? 'bg-primary/20 border-primary/50' :
                                node.status === 'Standby' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                    'bg-slate-900 border-white/5 opacity-40'
                                }`}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover/node:opacity-100 flex items-center justify-center text-[10px] font-black text-black select-none pointer-events-none bg-white rounded-2xl transition-all">
                                {node.id.toString(16).toUpperCase()}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 flex justify-between items-center opacity-30 text-[10px] font-black uppercase tracking-[0.5em] border-t border-white/5 pt-8">
                    <span>Mesh_ID: xG_NODAL_GEN_2.4</span>
                    <div className="flex gap-10">
                        <span>Attestation: Verified</span>
                        <span>Uptime: 99.98%</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
