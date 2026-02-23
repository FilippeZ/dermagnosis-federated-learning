import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CONFIG } from '../config';

const SystemConfig = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchConfig = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE}/system/config`);
            if (response.data.success) {
                setConfig(response.data.config);
            }
        } catch (err) {
            console.error("Config fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleModify = async (key) => {
        const currentValue = config[key];
        const newValue = prompt(`Modify ${key.replace('_', ' ').toUpperCase()}:`, currentValue);

        if (newValue !== null && newValue !== currentValue) {
            try {
                const response = await axios.post(`${CONFIG.API_BASE}/system/config/update`, {
                    key,
                    value: isNaN(newValue) ? newValue : parseFloat(newValue)
                });
                if (response.data.success) {
                    showToast(response.data.msg);
                    fetchConfig();
                }
            } catch (err) {
                showToast("Failed to update configuration.", "error");
            }
        }
    };

    const handleRotateKey = async () => {
        try {
            const response = await axios.post(`${CONFIG.API_BASE}/system/hsm/rotate`);
            if (response.data.success) {
                showToast(response.data.msg, 'primary');
            }
        } catch (err) {
            showToast("HSM rotation failed.", "error");
        }
    };

    const configItems = config ? [
        { key: 'ai_threshold', category: 'AI INFERENCE', label: 'Bayesian Confidence Threshold', value: config.ai_threshold, icon: 'psychology' },
        { key: 'min_node_contribution', category: 'FEDERATED', label: 'Minimum Node Contribution', value: `${config.min_node_contribution}%`, icon: 'hub' },
        { key: 'privacy_noise', category: 'PRIVACY', label: 'Laplacian ε-Differential Noise', value: config.privacy_noise, icon: 'shield_lock' },
        { key: 'purge_lineage', category: 'SYSTEM', label: 'Auto-Purge Inactive Lineage', value: `${config.purge_lineage} Days`, icon: 'auto_delete' },
    ] : [];

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
                            {toast.type === 'success' ? 'check_circle' : toast.type === 'primary' ? 'security' : 'error'}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-widest">{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black uppercase tracking-[0.25em] text-slate-100">
                        System <span className="text-primary glow-primary italic">Config</span>
                    </h2>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] px-0.5">
                        Global Operational Parameters & Neural Thresholds
                    </p>
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar pr-4">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center h-64">
                        <span className="material-symbols-outlined text-primary animate-spin text-4xl">refresh</span>
                    </div>
                ) : (
                    configItems.map((item, idx) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel p-8 rounded-[2.5rem] border-white/10 flex items-center justify-between hover:bg-white/5 transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="size-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                                    <span className="material-symbols-outlined text-primary text-2xl font-light">{item.icon}</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.category}</p>
                                    <p className="text-sm font-black text-slate-100 tracking-tight">{item.label}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-right">
                                <span className="text-xl font-black text-primary font-mono">{item.value}</span>
                                <button
                                    onClick={() => handleModify(item.key)}
                                    className="text-[10px] font-black uppercase text-slate-600 hover:text-white underline underline-offset-4 decoration-primary/40 active:scale-95 transition-all"
                                >
                                    Modify
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}

                {/* Advanced Security Block */}
                <div className="col-span-full glass-panel rounded-[3rem] p-10 border-white/10 bg-gradient-to-br from-primary/5 to-transparent flex flex-col gap-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Hardware Security Module (HSM)</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                                Intel SGX Enclave: STATUS_LOCKED
                            </span>
                            <p className="text-[11px] text-slate-400 font-bold italic">Secure multi-party aggregation active in hardware-isolated trusted environment.</p>
                        </div>
                        <button
                            onClick={handleRotateKey}
                            className="px-8 py-3 bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 rounded-xl hover:bg-white/5 transition-all active:scale-95 shadow-xl"
                        >
                            Rotate Root Key
                        </button>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default SystemConfig;
