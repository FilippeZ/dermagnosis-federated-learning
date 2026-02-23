import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONFIG } from '../config';

const ArchitectureNode = ({ icon, title, desc, status, color, bg, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.6 }}
        className={`relative p-6 rounded-3xl border border-white/10 ${bg} backdrop-blur-xl group hover:border-primary/50 transition-all shadow-2xl overflow-hidden`}
    >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">{icon}</span>
        </div>
        <div className="flex gap-4 items-start relative z-10">
            <div className={`p-3 rounded-2xl ${bg.replace('/5', '/20')} border border-white/10 group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">
                        {title}
                    </h4>
                    <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded border border-white/5 text-slate-500 uppercase tracking-widest leading-none">
                        {status}
                    </span>
                </div>
                <p className="text-[12px] text-slate-200 font-medium leading-relaxed italic">{desc}</p>
            </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
    </motion.div>
);

const CloudNode = ({ name, region, status, delay, icon, color }) => (
    <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className="p-6 rounded-[2rem] glass-panel border border-white/5 bg-slate-900/40 relative group overflow-hidden"
    >
        <div className="absolute -top-10 -right-10 size-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: color }}></div>
        <div className="flex flex-col gap-4 items-center text-center">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-primary/40 transition-colors">
                <span className="material-symbols-outlined text-3xl" style={{ color: color }}>{icon}</span>
            </div>
            <div>
                <h5 className="text-lg font-black text-slate-100 uppercase tracking-tighter">{name} Cluster</h5>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{region}</p>
            </div>
            <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="text-left">
                    <p className="text-[8px] font-black text-slate-500 uppercase">Latency</p>
                    <p className="text-xs font-mono text-slate-300">{delay}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-500 uppercase">Status</p>
                    <p className={`text-xs font-bold ${status === 'Syncing' ? 'text-amber-400 animate-pulse' : 'text-emerald-500'}`}>{status}</p>
                </div>
            </div>
        </div>
    </motion.div>
);

const FlowPacket = ({ delay, duration, d, color }) => (
    <motion.circle
        r="3"
        fill={color}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
        }}
        style={{ offsetPath: `path("${d}")` }}
    >
        <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />
    </motion.circle>
);

const Architecture = () => {
    const mainNodes = [
        { id: 1, icon: 'clinical_notes', title: 'Clinical Ingestion', desc: 'Secure entry for multimodal patient records.', color: 'text-primary', bg: 'bg-primary/5', status: 'ACTIVE' },
        { id: 2, icon: 'shield_lock', title: 'Privacy Shield', desc: 'Differential Privacy masking & AES encryption.', color: 'text-amber-400', bg: 'bg-amber-400/5', status: 'SECURE' },
        { id: 3, icon: 'hub', title: 'Bayesian Hub', desc: 'Central inference & XAI weight synthesis.', color: 'text-purple-400', bg: 'bg-purple-400/5', status: 'SYNCING' },
        { id: 4, icon: 'cloud_sync', title: 'Distributed Mesh', desc: 'Multi-cloud synchronization layer.', color: 'text-emerald-400', bg: 'bg-emerald-400/5', status: 'LIVE' },
    ];

    const logs = [
        { time: '15:20:10', step: 'INGEST', detail: 'Payload 0xFA3 initialized', color: 'text-primary' },
        { time: '15:20:12', step: 'PRIVC', detail: 'Laplacian noise injection complete', color: 'text-amber-400' },
        { time: '15:20:15', step: 'XAI', detail: 'Feature significance vectors mapped', color: 'text-purple-400' },
        { time: '15:20:18', step: 'MESH', detail: 'Attestation verified across 3 zones', color: 'text-emerald-400' },
    ];

    // SVG Paths for the flow
    const path1 = "M 320 120 C 450 120, 450 120, 580 120";
    const path2 = "M 320 230 C 450 230, 450 230, 580 230";
    const path3 = "M 320 340 C 450 340, 450 340, 580 340";
    const path4 = "M 320 450 C 450 450, 450 450, 580 450";

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col min-h-full gap-8 p-10 bg-slate-950/20"
        >
            <header className="flex justify-between items-start">
                <div className="flex gap-6 items-center">
                    <div className="size-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                        <span className="material-symbols-outlined text-primary text-4xl relative z-10">account_tree</span>
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter">
                            System <span className="text-primary glow-primary italic">Intelligence</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">PROD_RUNTIME_V{CONFIG.SYSTEM_VERSION}</span>
                            <span className="size-1 rounded-full bg-slate-700"></span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Status: Nominal</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-4 glass-panel rounded-2xl border-white/5 flex items-center gap-6 group">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Mesh Health</p>
                            <p className="text-xl font-black text-emerald-500 tracking-tighter">100.0%</p>
                        </div>
                        <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-500 animate-spin-slow">rebase_edit</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-12 gap-10 items-stretch min-h-0">
                {/* Visual Architecture Map */}
                <div className="col-span-8 flex flex-col gap-6 relative">
                    <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full opacity-40">
                            <defs>
                                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06f9f9" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                            {/* Animated Flow Packets */}
                            <FlowPacket d={path1} color="#06f9f9" duration={4} delay={0} />
                            <FlowPacket d={path1} color="#06f9f9" duration={4} delay={2} />
                            <FlowPacket d={path2} color="#7c3aed" duration={3} delay={1} />
                            <FlowPacket d={path3} color="#a855f7" duration={5} delay={0.5} />
                            <FlowPacket d={path4} color="#10b981" duration={4} delay={2.5} />
                        </svg>
                    </div>

                    <div className="grid grid-cols-2 gap-8 h-full">
                        <div className="flex flex-col justify-between py-4">
                            {mainNodes.slice(0, 4).map((node, i) => (
                                <ArchitectureNode key={node.id} {...node} delay={0.2 + i * 0.1} />
                            ))}
                        </div>

                        <div className="flex flex-col gap-8 justify-center">
                            <CloudNode name="AWS" region="us-east-1" status="Optimal" delay="12ms" icon="cloud" color="#ff9900" />
                            <CloudNode name="GCP" region="europe-west1" status="Optimal" delay="28ms" icon="cloud_done" color="#06f9f9" />
                            <CloudNode name="Azure" region="asia-east1" status="Syncing" delay="114ms" icon="cloud_sync" color="#3b82f6" />
                        </div>
                    </div>
                </div>

                {/* Performance & Security HUDs */}
                <div className="col-span-4 flex flex-col gap-8">
                    {/* Security & Integrity card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="glass-panel rounded-[2.5rem] p-8 border-white/5 flex flex-col gap-6 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">security</span>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-100">Security HUD</h3>
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 animate-pulse">ENCRYPT_AES_256</span>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                                    <span>Differential Privacy ε</span>
                                    <span className="text-primary font-mono">1.42 / 2.0</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '71%' }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                                    <span>Entropy Level</span>
                                    <span className="text-emerald-500 font-mono">99.9%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '99.9%' }} transition={{ duration: 1 }} className="h-full bg-emerald-500" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-5 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] space-y-2 text-slate-400 tabular-nums">
                            <p className="text-emerald-500">{" >> "} [OK] TEE ATTESTATION SUCCESS</p>
                            <p>{" >> "} [OK] SGX HARDWARE ENCLAVE ACTIVE</p>
                            <p>{" >> "} [OK] FEDERATED WEIGHTS VERIFIED</p>
                        </div>
                    </motion.div>

                    {/* FIFO Lineage Hub */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 }}
                        className="glass-panel flex-1 rounded-[2.5rem] p-8 border-white/5 flex flex-col gap-6 bg-slate-900/10 backdrop-blur-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-400">
                                <span className="material-symbols-outlined">history</span>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em]">FIFO Provenance</h3>
                            </div>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">LIVE_SYNC</span>
                        </div>

                        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 + i * 0.1 }}
                                    className="flex gap-4 items-start border-l border-white/5 pl-4 relative"
                                >
                                    <div className="absolute -left-[5px] top-1 size-2 rounded-full bg-slate-800 border border-white/20"></div>
                                    <span className="text-[9px] font-mono text-slate-600 font-black pt-1">{log.time}</span>
                                    <div className="space-y-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${log.color} bg-white/5 px-1.5 py-0.5 rounded`}>{log.step}</span>
                                        <p className="text-[11px] text-slate-300 font-bold italic leading-tight">{log.detail}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center opacity-30">
                            <span className="text-[8px] font-black uppercase tracking-widest font-mono">SIGN: x88_GNOSIS</span>
                            <span className="text-[8px] font-mono uppercase tracking-widest">Hash: 14E...0F1</span>
                        </div>
                    </motion.div>
                </div>
            </main>
        </motion.div>
    );
};

export default Architecture;
