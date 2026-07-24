import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CONFIG } from '../config';

const SystemConfig = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editValue, setEditValue] = useState('');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
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

    const openModifyModal = (item) => {
        setEditingItem(item);
        setEditValue(config[item.key]);
    };

    const saveModifiedConfig = async () => {
        if (!editingItem) return;
        try {
            const val = isNaN(editValue) ? editValue : parseFloat(editValue);
            const response = await axios.post(`${CONFIG.API_BASE}/system/config/update`, {
                key: editingItem.key,
                value: val
            });
            if (response.data.success) {
                showToast(response.data.msg || "Parameter updated successfully.");
                fetchConfig();
                setEditingItem(null);
            }
        } catch (err) {
            showToast("Failed to update configuration.", "error");
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
        <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50 overflow-y-auto custom-scrollbar relative">
            {/* Notification Toast */}
            {toast && (
                <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-3 shadow-xl ${
                    toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    <span className="material-symbols-outlined text-lg">
                        {toast.type === 'success' ? 'check_circle' : 'security'}
                    </span>
                    {toast.msg}
                </div>
            )}

            {/* Header Toolbar */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-900">
                        System <span className="text-sky-600">Config</span>
                    </h1>
                    <p className="text-xs text-slate-500">Global Operational Parameters &amp; Neural Thresholds</p>
                </div>
            </header>

            {/* Parameter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center py-16 text-slate-400 gap-3">
                        <span className="material-symbols-outlined text-sky-600 animate-spin text-3xl">refresh</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Loading System Parameters...</span>
                    </div>
                ) : (
                    configItems.map((item) => (
                        <div key={item.key} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sky-600 text-2xl">{item.icon}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider block">{item.category}</span>
                                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.label}</h4>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-right">
                                <span className="text-xl font-black text-slate-900 font-mono">{item.value}</span>
                                <button
                                    onClick={() => openModifyModal(item)}
                                    className="px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                >
                                    Modify
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {/* Hardware Security Module (HSM) Block */}
                <div className="col-span-full p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Hardware Security Module (HSM)
                    </h3>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <span className="text-emerald-600 text-xs font-bold uppercase flex items-center gap-2 mb-1">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Intel SGX Enclave: STATUS_LOCKED
                            </span>
                            <p className="text-xs text-slate-600">
                                Secure multi-party aggregation active in hardware-isolated trusted environment.
                            </p>
                        </div>
                        <button
                            onClick={handleRotateKey}
                            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 border border-sky-500 text-xs font-bold uppercase text-white tracking-wider transition-colors shadow-sm"
                        >
                            Rotate Root Key
                        </button>
                    </div>
                </div>
            </div>

            {/* Parameter Modify Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-900 uppercase">Modify {editingItem.label}</h3>
                            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-900">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase block">New Value</label>
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono font-bold text-sm outline-none focus:border-sky-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold uppercase hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveModifiedConfig}
                                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black uppercase shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemConfig;
