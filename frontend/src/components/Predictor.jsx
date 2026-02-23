import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CONFIG } from '../config';

const Predictor = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [stage, setStage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [clinicalNote, setClinicalNote] = useState("");
    const [error, setError] = useState(null);
    const [patientData, setPatientData] = useState({
        age: 45,
        skin_type: 2,
        ethnicity: "Caucasian",
        sun_exposure: 10,
        genetic_risk: false,
        family_history: false,
        previous_melanoma: false,
        immunosuppressed: false,
        asymmetry: false,
        border_irregular: false,
        color_variation: false,
        diameter_mm: 5.0,
        evolution: false
    });

    const [results, setResults] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
            setError(null);
        }
    };

    const runAnalysis = async () => {
        if (!selectedFile) {
            setError("Diagnostic initialization failed: No visual source provided.");
            return;
        }

        setIsAnalyzing(true);
        setScanProgress(0);
        setStage("INITIALIZING_DIAGNOSTIC_CORE");
        setError(null);

        const progInterval = setInterval(() => {
            setScanProgress(p => {
                if (p < 30) setStage("EXTRACTING_RADIOMICS");
                else if (p < 60) setStage("PROCESSING_MEDICAL_NLP");
                else if (p < 90) setStage("COMPUTING_BAYESIAN_MAP");
                return p < 95 ? p + 2 : p;
            });
        }, 800 / 20); // Sync with feel

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('note', clinicalNote);

            Object.entries(patientData).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await axios.post(`${CONFIG.API_BASE}/analyze/full`, formData);

            if (response.data.success) {
                setResults(response.data);
                setScanProgress(100);
                setStage("DIAGNOSIS_SYNC_COMPLETE");
                setTimeout(() => setIsAnalyzing(false), 1000);
            } else {
                throw new Error("Diagnostic Engine returned unexpected status.");
            }
        } catch (err) {
            console.error("Analysis failed", err);
            const msg = err.response?.data?.detail || "CRITICAL_SYSTEM_ERROR: Diagnostic core disconnect.";
            setError(msg);
            setIsAnalyzing(false);
        } finally {
            clearInterval(progInterval);
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
                        Multimodal <span className="text-primary glow-primary italic">Predictor</span> Lab
                    </h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <span className={`size-1.5 rounded-full ${isAnalyzing ? 'bg-primary animate-ping' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></span>
                        Neural Core Connectivity // Build {CONFIG.SYSTEM_VERSION}
                    </p>
                </div>
                {error && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-black uppercase tracking-widest animate-pulse max-w-lg shadow-2xl">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg">dangerous</span>
                            {error}
                        </div>
                    </motion.div>
                )}
            </header>

            <main className="flex flex-1 overflow-hidden gap-8">
                {/* Left Section: Imaging & NLP Hub */}
                <section className="flex flex-col flex-[1.4] gap-6 min-w-0">
                    <div className="relative flex flex-1 flex-col glass-panel rounded-[2.5rem] overflow-hidden group">
                        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-8 py-5">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-xl">biotech</span>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-100">Image Analysis Feed</span>
                            </div>
                            <div className="flex gap-3">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="btn-action px-8 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg"
                                >
                                    Initialize Feed
                                </button>
                            </div>
                        </div>

                        <div className="relative flex-1 bg-black/60 flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                                <div className="relative group/view h-full w-full flex items-center justify-center p-8">
                                    <img
                                        className={`max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-1000 ${isAnalyzing ? 'scale-110 blur-xl opacity-20' : 'opacity-90 group-hover/view:scale-[1.02]'}`}
                                        src={previewUrl}
                                        alt="L4 Feed"
                                    />
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative size-64">
                                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin-slow"></div>
                                                <div className="absolute inset-4 border-2 border-primary/40 rounded-full animate-reverse-spin"></div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                                    <span className="text-4xl font-black text-primary">{scanProgress}%</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 animate-pulse">{stage}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Scanning Line overlay */}
                                    <AnimatePresence>
                                        {isAnalyzing && (
                                            <motion.div
                                                initial={{ top: '0%' }}
                                                animate={{ top: '100%' }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                className="absolute inset-x-0 h-1 bg-primary/50 shadow-[0_0_20px_#06f9f9] z-50"
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 text-slate-700 animate-pulse">
                                    <div className="size-24 rounded-3xl border-2 border-dashed border-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-6xl">add_a_photo</span>
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Waiting for Optical Input_</span>
                                </div>
                            )}

                            {/* Viewport HUD */}
                            <div className="absolute inset-0 border border-white/5 pointer-events-none">
                                <div className="absolute top-1/2 left-0 w-full h-px bg-white/5"></div>
                                <div className="absolute top-0 left-1/2 h-full w-px bg-white/5"></div>
                                <div className="absolute top-8 left-8 p-6 glass-panel border-primary/30 rounded-3xl min-w-[240px] space-y-5 backdrop-blur-3xl bg-black/50 shadow-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural Features</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { l: 'Asymmetry', v: results?.image?.features?.color_asymmetry?.toFixed(2) || '0.00', unit: 'idx' },
                                            { l: 'LoG_Energy', v: results?.image?.features?.log_energy?.toFixed(3) || '0.000', unit: 'ev' },
                                            { l: 'Hessian_Ratio', v: results?.image?.features?.hessian_neg_ratio?.toFixed(2) || '0.00', unit: 'pts' },
                                            { l: 'Homogeneity', v: results?.image?.features?.glcm_homogeneity_mean?.toFixed(2) || '0.00', unit: 'glcm' }
                                        ].map(f => (
                                            <div key={f.l} className="flex justify-between items-end border-b border-white/5 pb-1 cursor-help group/feat">
                                                <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase transition-colors group-hover/feat:text-primary">{f.l}</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-[11px] text-slate-100 font-black tabular-nums">{f.v}</span>
                                                    <span className="text-[7px] text-slate-600 font-black uppercase">{f.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 glass-panel rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-8 py-5">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-xl">terminal</span>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-100">Medical-NLP Engine Feed</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">SYSLOG_V2.4_STABLE</span>
                                <div className="h-4 w-px bg-white/10"></div>
                                <span className="text-[9px] text-emerald-400/60 font-black uppercase italic animate-pulse">Stream Active</span>
                            </div>
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto font-mono text-[11px] bg-black/50 custom-scrollbar space-y-4">
                            <div className="text-slate-500 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                                [HUB_READY] Clinical BERT-v4 loaded. Weights optimized for oncology terminology.
                            </div>
                            {clinicalNote && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 pl-4 border-l-2 border-white/10 italic leading-relaxed">
                                    [INGESTION] "{clinicalNote.substring(0, 150)}{clinicalNote.length > 150 ? '...' : ''}"
                                </motion.div>
                            )}
                            <AnimatePresence>
                                {results?.nlp?.risk_keywords?.map((kw, i) => (
                                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={i} className="text-red-400 flex items-center gap-3 bg-red-400/5 p-2 rounded-lg border border-red-400/10">
                                        <span className="material-symbols-outlined text-lg">warning</span>
                                        <span>[HIGH_PRIORITY] Malignant marker <span className="text-white bg-red-500 px-2 py-0.5 rounded text-[10px] font-black">{kw.toUpperCase()}</span> detected in clinical linguistics.</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {isAnalyzing && (
                                <div className="text-primary italic animate-pulse pl-4 border-l-2 border-primary/40">
                                    [PROCESSING] Decrypting clinical intent and lab variance...
                                </div>
                            )}
                            {results && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-white/10 text-slate-300 text-xs font-medium leading-relaxed">
                                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                                        Clinical Abstract
                                    </div>
                                    {results.nlp.summary}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Right Section: Clinical Profiling */}
                <aside className="w-[480px] flex flex-col gap-6">
                    <div className="flex flex-col rounded-[2.5rem] glass-panel p-10 shadow-3xl h-full overflow-y-auto custom-scrollbar border-white/10 relative">
                        <header className="flex items-center gap-5 mb-12 pb-8 border-b border-white/5">
                            <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                                <span className="material-symbols-outlined text-primary text-4xl">patient_list</span>
                            </div>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary leading-none mb-1.5">Clinical Profiling</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Metadata Synthesis Core</p>
                            </div>
                        </header>

                        <div className="space-y-10 flex-1">
                            {/* Inputs Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] block px-1">Patient Age</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-slate-100 focus:border-primary/50 text-base font-black transition-all outline-none focus:bg-white/10"
                                        type="number" value={patientData.age}
                                        onChange={(e) => setPatientData({ ...patientData, age: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] block px-1">Skin Type (FIT-Scale)</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-slate-100 focus:border-primary/50 text-sm font-black transition-all outline-none appearance-none cursor-pointer focus:bg-white/10"
                                        value={patientData.skin_type}
                                        onChange={(e) => setPatientData({ ...patientData, skin_type: parseInt(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(t => <option key={t} value={t}>Type {t} Scale</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] block px-1">Ethnicity Group</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-slate-100 focus:border-primary/50 text-sm font-black transition-all outline-none appearance-none cursor-pointer focus:bg-white/10"
                                        value={patientData.ethnicity}
                                        onChange={(e) => setPatientData({ ...patientData, ethnicity: e.target.value })}
                                    >
                                        {["Caucasian", "Hispanic", "Asian", "African", "Other"].map(eth => <option key={eth} value={eth}>{eth}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] block px-1">UV Exposure (Years)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-slate-100 focus:border-primary/50 text-base font-black transition-all outline-none focus:bg-white/10"
                                        type="number" value={patientData.sun_exposure}
                                        onChange={(e) => setPatientData({ ...patientData, sun_exposure: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-1">Risk Factor Mapping</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Genetic Markers', key: 'genetic_risk', icon: 'dna' },
                                        { label: 'Family History', key: 'family_history', icon: 'groups' },
                                        { label: 'Prior Melanoma', key: 'previous_melanoma', icon: 'history' },
                                        { label: 'Immunosuppressed', key: 'immunosuppressed', icon: 'shield_locked' },
                                        { label: 'Asymmetry_V', key: 'asymmetry', icon: 'line_style' },
                                        { label: 'Evolution_V', key: 'evolution', icon: 'trending_up' }
                                    ].map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => setPatientData({ ...patientData, [opt.key]: !patientData[opt.key] })}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${patientData[opt.key]
                                                ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(6,249,249,0.1)]'
                                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <label className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] block px-1">Clinical Observations</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-slate-100 focus:border-primary/50 text-xs font-semibold min-h-[160px] resize-none outline-none custom-scrollbar leading-relaxed focus:bg-white/10 shadow-inner"
                                    placeholder="Enter findings, drug history, or lab results (e.g. LDH: 280, S100: 0.2)..."
                                    value={clinicalNote}
                                    onChange={(e) => setClinicalNote(e.target.value)}
                                />
                            </div>

                            {/* Results Panel */}
                            <AnimatePresence>
                                {results && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="p-10 rounded-[3rem] border-2 flex flex-col gap-8 items-center text-center shadow-4xl relative overflow-hidden bg-slate-900/60 backdrop-blur-3xl"
                                        style={{ borderColor: `${results.diagnosis.risk_color}44` }}
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-20">
                                            <span className="material-symbols-outlined text-[8rem]" style={{ color: results.diagnosis.risk_color }}>verified_user</span>
                                        </div>
                                        <div className="space-y-2 relative z-10">
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Posterior Probability</span>
                                            <h3 className="text-7xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 30px ${results.diagnosis.risk_color}66` }}>
                                                {(results.diagnosis.posterior * 100).toFixed(1)}%
                                            </h3>
                                        </div>
                                        <div className="flex flex-col gap-4 w-full relative z-10">
                                            <div className="px-10 py-3.5 rounded-full text-[12px] font-black uppercase tracking-[0.3em] text-white shadow-2xl" style={{ backgroundColor: results.diagnosis.risk_color }}>
                                                {results.diagnosis.risk_level} CATEGORY
                                            </div>
                                            <div className="flex justify-between items-center px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>Confidence Score</span>
                                                <span className="text-primary">{(results.diagnosis.confidence * 100).toFixed(0)}% OPTIMAL</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-white/10"></div>
                                        <p className="text-[14px] font-bold text-slate-300 leading-relaxed italic relative z-10 px-4">
                                            "{results.diagnosis.recommendation}"
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Analysis Trigger */}
                        <div className="mt-12 pt-12 border-t border-white/5">
                            <button
                                onClick={runAnalysis}
                                disabled={isAnalyzing || !selectedFile}
                                className="group relative w-full overflow-hidden rounded-[3rem] bg-primary p-8 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(6,249,249,0.25)] disabled:opacity-20 disabled:grayscale disabled:scale-100"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-5 text-black font-black">
                                    <span className={`material-symbols-outlined text-3xl ${isAnalyzing ? 'animate-spin' : ''}`}>
                                        {isAnalyzing ? 'cached' : 'analytics'}
                                    </span>
                                    <span className="text-base tracking-[0.5em] uppercase">
                                        {isAnalyzing ? 'Decrypting Neural Map...' : 'Initialize Diagnostics'}
                                    </span>
                                </div>
                                <motion.div
                                    className="absolute inset-0 bg-white/30 -translate-x-full"
                                    animate={isAnalyzing ? { x: '100%' } : { x: '-100%' }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                />
                            </button>
                            <div className="flex justify-center items-center gap-6 mt-8">
                                <p className="text-[9px] text-slate-600 uppercase tracking-[0.4em] font-black">
                                    High-Priority Queue // GPU_ACCEL_ACTIVE
                                </p>
                                <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                                <p className="text-[9px] text-slate-600 uppercase tracking-[0.4em] font-black">
                                    VRAM: 24GB AVAILABLE
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Status Footer HUD */}
            <footer className="px-12 py-5 glass-panel border-white/5 rounded-[2rem] flex items-center justify-between shadow-3xl bg-black/30">
                <div className="flex gap-16 text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black">
                    <div className="flex items-center gap-4 group cursor-help">
                        <span className={`size-2.5 rounded-full shadow-[0_0_10px_current] ${isAnalyzing ? 'bg-amber-500 animate-pulse text-amber-500' : 'bg-emerald-500 text-emerald-500'}`}></span>
                        L4-CORE: <span className={isAnalyzing ? 'text-amber-500' : 'text-emerald-500'}>{isAnalyzing ? 'BUSY' : 'OPTIMAL'}</span>
                    </div>
                    <div className="flex items-center gap-4 group cursor-help">
                        <span className="size-2.5 rounded-full bg-primary shadow-[0_0_10px_#06f9f9] text-primary"></span>
                        VRAM_STREAM: <span className="text-primary">{isAnalyzing ? 'SATURATED' : 'IDLE'}</span>
                    </div>
                    <AnimatePresence>
                        {isAnalyzing && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4 text-primary animate-pulse">
                                <span className="material-symbols-outlined text-lg">broadcast_on_home</span>
                                TRANSMITTING_RADIOMICS_MAPS...
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-[10px] font-mono text-slate-600 font-black tracking-widest uppercase flex items-center gap-4">
                        <span className="opacity-40">STATION_ID: DERMA-VAULT-NODE-07</span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className="text-slate-400">{CONFIG.SYSTEM_VERSION}</span>
                    </div>
                </div>
            </footer>
        </motion.div>
    );
};

export default Predictor;
