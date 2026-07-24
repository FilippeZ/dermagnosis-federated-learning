import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CONFIG } from '../config';

const ClinicalData = ({ highlightPatientId, setActiveTab, onPatientViewed }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const highlightRowRef = useRef(null);

    const fetchRegistry = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE}/clinical/registry`);
            if (response.data.success) {
                setPatients(response.data.patients);
            }
        } catch (err) {
            console.warn("Failed to fetch registry — using fallback data", err);
            // Offline fallback with sample patients
            setPatients([
                { id: "PX-2044", name: "Elena Vance", age: 42, type: "Melanoma", risk: "High", date: "2026-02-21" },
                { id: "PX-2045", name: "Gordon Freeman", age: 31, type: "Nevus", risk: "Low", date: "2026-02-21" },
                { id: "PX-2046", name: "Alyx Vance", age: 58, type: "BCC", risk: "Moderate", date: "2026-02-20" },
                { id: "PX-2047", name: "Barney Calhoun", age: 45, type: "Melanoma", risk: "High", date: "2026-02-20" },
                { id: "PX-111836-853", name: "Clara Oswald", age: 36, type: "Melanoma", risk: "Moderate", date: "2026-02-22" },
                { id: "PX-111449-634", name: "Isaac Kleiner", age: 64, type: "BCC", risk: "High", date: "2026-02-22" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistry();
    }, []);

    // When highlightPatientId changes (after new analysis), auto-open that patient
    useEffect(() => {
        if (highlightPatientId && patients.length > 0) {
            // Check if the patient is in the list
            const found = patients.find(p => p.id === highlightPatientId);
            if (found) {
                handleOpenPatient(highlightPatientId);
                // Scroll the highlighted row into view
                setTimeout(() => {
                    if (highlightRowRef.current) {
                        highlightRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            } else {
                // Not in list yet — refetch to get the newly created patient
                fetchRegistry().then(() => {
                    setTimeout(() => handleOpenPatient(highlightPatientId), 500);
                });
            }
            // Notify parent that we've handled the highlight
            if (onPatientViewed) onPatientViewed();
        }
    }, [highlightPatientId, patients.length]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRegistry();
        setTimeout(() => setRefreshing(false), 600);
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE}/clinical/export`);
            if (response.data.success) {
                setToast({ msg: response.data.msg, type: 'success' });
                
                const exportData = JSON.stringify(response.data, null, 2);
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = response.data.filename || `EHR_Registry_Export_${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                setTimeout(() => setToast(null), 4000);
            }
        } catch (err) {
            // Offline fallback export
            const exportData = JSON.stringify({
                version: "2.4.0",
                timestamp: new Date().toISOString(),
                patients: patients,
                note: "Exported from offline fallback data"
            }, null, 2);
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `EHR_Registry_Export_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setToast({ msg: "Registry exported (offline mode).", type: 'success' });
            setTimeout(() => setToast(null), 4000);
        }
    };

    const handleOpenPatient = async (id) => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE}/clinical/patient/${id}`);
            if (response.data.success) {
                setSelectedPatient(response.data.detail);
            }
        } catch (err) {
            // Fallback: use local patient data
            const local = patients.find(p => p.id === id);
            if (local) {
                setSelectedPatient({
                    ...local,
                    history: "Clinical notes not available (backend offline). Radiomics and analysis data stored locally.",
                    radiomics: { energy: 0.82, entropy: 0.31 }
                });
            }
        }
    };

    const filteredPatients = patients.filter(p =>
        p.id.toLowerCase().includes(filter.toLowerCase()) ||
        (p.name || '').toLowerCase().includes(filter.toLowerCase()) ||
        p.type.toLowerCase().includes(filter.toLowerCase()) ||
        p.risk.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50 overflow-y-auto custom-scrollbar relative">
            {/* Notification Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-3 shadow-xl ${
                            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {toast.type === 'success' ? 'check_circle' : 'warning'}
                        </span>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New analysis highlight banner */}
            <AnimatePresence>
                {highlightPatientId && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-3 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sky-600 text-xl">new_releases</span>
                        <div>
                            <p className="text-xs font-bold text-slate-900">
                                New analysis result — Patient <span className="font-mono text-sky-700">{highlightPatientId}</span> has been added to the registry
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Their record has been automatically opened below.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Toolbar */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-900 flex items-center gap-3">
                        <span className="material-symbols-outlined text-sky-600 text-3xl">folder_shared</span>
                        Patient Consultation <span className="text-sky-600">Records</span>
                    </h1>
                    <p className="text-xs text-slate-500">Clinical Patient History • Encrypted EHR Notes &amp; Diagnostic Reports</p>
                </div>
                <div className="flex items-center gap-3">
                    {setActiveTab && (
                        <button
                            onClick={() => setActiveTab('predictor')}
                            className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-base">biotech</span>
                            New Diagnostic
                        </button>
                    )}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                        title="Refresh Patient Registry"
                    >
                        <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin text-sky-600' : ''}`}>sync</span>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        Export Registry
                    </button>
                </div>
            </header>

            {/* Registry Table Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-sky-600 text-lg">folder_shared</span>
                        Electronic Health Records // Federated View
                        <span className="text-[10px] font-mono text-slate-400 ml-2">({filteredPatients.length} records)</span>
                    </h3>
                    <div className="w-full md:w-auto">
                        <input
                            className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium outline-none focus:border-sky-500"
                            placeholder="Filter by ID, name, diagnosis, risk..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
                        <span className="material-symbols-outlined text-sky-600 animate-spin text-3xl">refresh</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Loading EHR Registry...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                    <th className="py-3 px-4">Patient ID</th>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Age</th>
                                    <th className="py-3 px-4">Diagnosis</th>
                                    <th className="py-3 px-4">Risk Level</th>
                                    <th className="py-3 px-4">Ingestion Date</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPatients.map((p) => {
                                    const isHighlighted = p.id === highlightPatientId;
                                    return (
                                        <tr
                                            key={p.id}
                                            ref={isHighlighted ? highlightRowRef : null}
                                            className={`hover:bg-slate-50 transition-colors ${isHighlighted ? 'bg-sky-50 ring-2 ring-sky-300 ring-inset' : ''}`}
                                        >
                                            <td className="py-3.5 px-4 font-mono font-bold text-sky-600 flex items-center gap-2">
                                                {isHighlighted && (
                                                    <span className="size-2 rounded-full bg-sky-500 animate-pulse inline-block"></span>
                                                )}
                                                {p.id}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-700">{p.name || '—'}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-700">{p.age}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900">{p.type}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                                                    p.risk === 'High' || p.risk === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                    p.risk === 'Moderate' || p.risk === 'MODERATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                    {p.risk}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-500">{p.date}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => handleOpenPatient(p.id)}
                                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 transition-colors"
                                                    title="View Patient Analysis"
                                                >
                                                    <span className="material-symbols-outlined text-base">open_in_new</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredPatients.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-medium">
                                            No patients found matching "{filter}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Actions Bottom Bar */}
            {setActiveTab && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setActiveTab('predictor')}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-sky-600 text-2xl group-hover:scale-110 transition-transform">biotech</span>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase">Run New Diagnostic</h4>
                                <p className="text-[10px] text-slate-500">Analyze a new dermoscopic image</p>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-600 text-2xl group-hover:scale-110 transition-transform">space_dashboard</span>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase">Clinical Overview</h4>
                                <p className="text-[10px] text-slate-500">View system-wide performance metrics</p>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('simulation')}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-purple-600 text-2xl group-hover:scale-110 transition-transform">public</span>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase">FL Network</h4>
                                <p className="text-[10px] text-slate-500">View federated learning topology</p>
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {/* Patient Detail Modal */}
            <AnimatePresence>
                {selectedPatient && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 uppercase">{selectedPatient.id} Details</h3>
                                    <span className="text-xs text-sky-600 font-mono">Ingestion Date: {selectedPatient.date}</span>
                                </div>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900"
                                >
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedPatient.name && (
                                        <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Patient Name</span>
                                            <span className="text-sm font-bold text-slate-900">{selectedPatient.name}</span>
                                        </div>
                                    )}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Diagnosis</span>
                                        <span className="text-sm font-bold text-slate-900">{selectedPatient.type || selectedPatient.diagnosis}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Risk Category</span>
                                        <span className={`text-sm font-bold ${
                                            (selectedPatient.risk === 'High' || selectedPatient.risk === 'HIGH')
                                                ? 'text-rose-600'
                                                : (selectedPatient.risk === 'Moderate' || selectedPatient.risk === 'MODERATE')
                                                ? 'text-amber-600'
                                                : 'text-emerald-600'
                                        }`}>{selectedPatient.risk || selectedPatient.risk_level}</span>
                                    </div>
                                </div>
                                {selectedPatient.age && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Patient Age</span>
                                        <span className="text-sm font-bold text-slate-900">{selectedPatient.age} years</span>
                                    </div>
                                )}
                                {selectedPatient.history && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Clinical Observations</span>
                                        <p className="text-slate-700 font-mono text-[11px]">{selectedPatient.history}</p>
                                    </div>
                                )}
                                {selectedPatient.radiomics && Object.keys(selectedPatient.radiomics).length > 0 && (
                                    <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Radiomics Features</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(selectedPatient.radiomics).map(([key, val]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold">{key}</span>
                                                    <span className="text-[10px] font-mono text-sky-700 font-bold">{typeof val === 'number' ? val.toFixed(3) : val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Run diagnostic for this patient */}
                            {setActiveTab && (
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => setActiveTab('predictor')}
                                        className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">biotech</span>
                                        New Diagnostic
                                    </button>
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                                    >
                                        Close Record
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClinicalData;
