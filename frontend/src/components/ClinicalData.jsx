import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CONFIG } from '../config';

const ClinicalData = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                const response = await axios.get(`${CONFIG.API_BASE}/clinical/registry`);
                if (response.data.success) {
                    setPatients(response.data.patients);
                }
            } catch (err) {
                console.error("Failed to fetch registry", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistry();
    }, []);

    const handleExport = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE}/clinical/export`);
            if (response.data.success) {
                setToast({ msg: response.data.msg, type: 'success' });
                setTimeout(() => setToast(null), 5000);
                // Simulate download
                console.log("Downloading...", response.data.download_url);
            }
        } catch (err) {
            setToast({ msg: "Export failed. Server unreachable.", type: 'error' });
            setTimeout(() => setToast(null), 5000);
        }
    };

    const handleOpenPatient = async (id) => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE}/clinical/patient/${id}`);
            if (response.data.success) {
                setToast({ msg: `Accessing ${id}: ${response.data.detail.diagnosis} Analysis`, type: 'primary' });
                setTimeout(() => setToast(null), 5000);
            }
        } catch (err) {
            console.error("Discovery failed", err);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.id.toLowerCase().includes(filter.toLowerCase()) ||
        p.type.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-10 flex flex-col min-h-full gap-8 bg-slate-950/20 relative"
        >
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`absolute top-10 left-1/2 z-50 px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            toast.type === 'primary' ? 'bg-primary/10 border-primary/20 text-primary' :
                                'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">
                            {toast.type === 'success' ? 'check_circle' : toast.type === 'primary' ? 'database' : 'error'}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-widest">{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black uppercase tracking-[0.25em] text-slate-100">
                        Clinical <span className="text-primary glow-primary italic">Registry</span>
                    </h2>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] px-0.5">
                        Patient Insight & Diagnostic History Management
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        className="px-6 py-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg shadow-primary/5 active:scale-95"
                    >
                        Neural_Export
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <div className="glass-panel rounded-[2.5rem] border-white/10 h-full flex flex-col overflow-hidden">
                    <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Electronic Health Records // Federated View</span>
                        <div className="flex gap-4">
                            <input
                                className="bg-black/20 border border-white/10 rounded-lg px-4 py-1.5 text-[10px] text-slate-100 font-bold focus:outline-none focus:border-primary/40 min-w-[200px]"
                                placeholder="Filter Registry..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <span className="material-symbols-outlined text-primary animate-spin text-4xl">refresh</span>
                            </div>
                        ) : (
                            <table className="w-full text-left border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <th className="pb-4 px-4">Patient ID</th>
                                        <th className="pb-4 px-4">Age</th>
                                        <th className="pb-4 px-4">Diagnosis</th>
                                        <th className="pb-4 px-4">Risk Level</th>
                                        <th className="pb-4 px-4">Ingestion Date</th>
                                        <th className="pb-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((p) => (
                                        <tr key={p.id} className="group transition-all hover:translate-x-1">
                                            <td className="py-4 px-4 bg-white/5 rounded-l-xl border-y border-l border-white/5 font-mono text-[11px] text-primary">{p.id}</td>
                                            <td className="py-4 px-4 bg-white/5 border-y border-white/5 text-[11px] font-bold text-slate-300">{p.age}</td>
                                            <td className="py-4 px-4 bg-white/5 border-y border-white/5 text-[11px] font-bold text-slate-100">{p.type}</td>
                                            <td className="py-4 px-4 bg-white/5 border-y border-white/5">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${p.risk === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    p.risk === 'Moderate' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    }`}>
                                                    {p.risk}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 bg-white/5 border-y border-white/5 text-[10px] text-slate-500 font-mono">{p.date}</td>
                                            <td className="py-4 px-4 bg-white/5 rounded-r-xl border-y border-r border-white/5 text-right">
                                                <button
                                                    onClick={() => handleOpenPatient(p.id)}
                                                    className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 group/btn transition-all active:scale-90"
                                                >
                                                    <span className="material-symbols-outlined text-slate-600 group-hover/btn:text-primary transition-colors text-lg">open_in_new</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default ClinicalData;
