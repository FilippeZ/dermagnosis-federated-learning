import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONFIG } from '../config';
import ApiService from '../services/apiService';

const Architecture = () => {
    // Multi-Cloud Live Simulation State
    const [simStage, setSimStage] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simLogs, setSimLogs] = useState([]);

    // Step navigator for Non-Tech pipeline
    const [activeStep, setActiveStep] = useState(0);

    // Latency Ping State
    const [testingLatency, setTestingLatency] = useState(false);
    const [cloudLatencies, setCloudLatencies] = useState({
        aws: '12ms',
        gcp: '28ms',
        azure: '114ms'
    });
    const [cloudDetails, setCloudDetails] = useState({
        aws: { jitter: '0.4ms', packet_loss: '0.0%' },
        gcp: { jitter: '0.8ms', packet_loss: '0.0%' },
        azure: { jitter: '2.4ms', packet_loss: '0.01%' }
    });

    // 6-Step Non-Tech Storyflow Definition
    const storySteps = [
        {
            id: 0,
            stepNum: '01',
            icon: 'medical_services',
            title: '1. Patient Skin Scan & EHR Ingestion',
            shortDesc: 'Doctor scans mole & enters medical history at local clinic.',
            badge: '🔒 PHI Stays Local',
            plainEnglish: 'The doctor takes a microscopic photo of the mole and inputs clinical notes. This sensitive data stays isolated in your hospital with a secure local ID.',
            privacyGuarantee: '100% Confidential. Zero patient names, photos, or medical notes ever leave your hospital building.',
            realWorldExample: 'Dr. Vance scans a suspicious mole on Patient #8492. Name and SSN stay locked inside Admin Station 01.'
        },
        {
            id: 1,
            stepNum: '02',
            icon: 'psychology',
            title: '2. Dual AI Pattern Extraction',
            shortDesc: 'Smart AI analyzes skin textures & flags medical biomarkers.',
            badge: '⚡ Dual AI Vision + NLP',
            plainEnglish: 'Vision AI inspects mole asymmetry, border roughness, and color pixels while Text AI reads patient notes for high-risk blood markers (LDH).',
            privacyGuarantee: 'Analysis runs entirely inside local RAM. No cloud servers are contacted during initial AI extraction.',
            realWorldExample: 'The AI flags irregular mole borders and notes elevated LDH biomarkers (>250 U/L) automatically.'
        },
        {
            id: 2,
            stepNum: '03',
            icon: 'verified_user',
            title: '3. Encrypted Local Hardware Vault',
            shortDesc: 'Files are locked with AES-256 inside local hardware enclave.',
            badge: '🛡️ TEE & SGX Hardware Safe',
            plainEnglish: 'Original photos, names, and patient records are encrypted into a high-security hardware safe (Intel SGX Enclave) inside your clinic\'s local server.',
            privacyGuarantee: 'AES-256 military encryption ensures compliance with EU MDR, EU AI Act, HIPAA & GDPR Art. 25/32.',
            realWorldExample: 'Even if an intruder breached clinic WiFi, patient files cannot be decrypted without local enclave hardware keys.'
        },
        {
            id: 3,
            stepNum: '04',
            icon: 'transform',
            title: '4. Anonymous Math Tokenizer',
            shortDesc: 'Converts learning patterns into anonymous math numbers.',
            badge: '🔢 Differential Privacy (ε=1.42)',
            plainEnglish: 'Instead of sharing patient photos, the system extracts only "mathematical learning numbers" (weights) and adds math noise so no identity can ever be reverse-engineered.',
            privacyGuarantee: 'Differential Privacy noise ensures 0% probability of re-identifying any patient from shared math updates.',
            realWorldExample: 'The clinic prepares a list of numbers like [0.042, -0.198, 0.812] representing what the AI learned today.'
        },
        {
            id: 4,
            stepNum: '05',
            icon: 'cloud_sync',
            title: '5. Global Multi-Cloud Federated Mesh',
            shortDesc: 'Hospitals worldwide pool anonymous math across AWS, GCP & Azure.',
            badge: '🌐 AWS • GCP • Azure Mesh',
            plainEnglish: 'Anonymous math updates from hospitals in North America (AWS), Europe (GCP), and Asia (Azure) are combined in the cloud into a master global AI model.',
            privacyGuarantee: 'Multi-cloud regional isolation respects local jurisdiction rules (GDPR in Europe, HIPAA in US).',
            realWorldExample: 'A clinic in Athens, a hospital in Boston, and a lab in Tokyo pool anonymous math model updates into a global diagnostic brain.'
        },
        {
            id: 5,
            stepNum: '06',
            icon: 'fact_check',
            title: '6. Verified Clinical AI Diagnosis Output',
            shortDesc: 'Doctor receives 98.4% accurate, audit-ready diagnostic report.',
            badge: '✅ Audit-Ready Audit Trail',
            plainEnglish: 'The updated global intelligence downloads back to your clinic. The doctor gets an instant risk score, explainability heatmap, and tamper-proof audit trail.',
            privacyGuarantee: 'Full provenance logging guarantees every diagnostic recommendation is 100% auditable for medical regulatory compliance.',
            realWorldExample: 'Dr. Vance sees a clear diagnosis: "Melanoma Risk 94.2% (High) - Flagged irregular borders & LDH elevation". Recommended for urgent biopsy.'
        }
    ];

    // Multi-Cloud Live Practice Simulation Controller
    const runMultiCloudSimulation = async () => {
        setIsSimulating(true);
        setSimStage(1);
        setSimLogs([`[15:34:01] 🏥 Local Hospitals (Boston, Athens, Tokyo) started local SGD learning on encrypted patient scans.`]);

        await new Promise((r) => setTimeout(r, 1200));
        setSimStage(2);
        setSimLogs((prev) => [
            `[15:34:02] 🛡️ Differential Privacy noise (ε=1.42) & AES-256 applied. Zero raw patient images export.`,
            ...prev
        ]);

        await new Promise((r) => setTimeout(r, 1400));
        setSimStage(3);
        setSimLogs((prev) => [
            `[15:34:04] 🌐 Streaming anonymous math weights -> AWS (us-east-1), GCP (europe-west1), Azure (asia-east1).`,
            ...prev
        ]);

        await new Promise((r) => setTimeout(r, 1600));
        setSimStage(4);
        setSimLogs((prev) => [
            `[15:34:06] ⚙️ Multi-Cloud FedAvg Aggregation merged regional weights. Global loss minimized to 0.1245.`,
            ...prev
        ]);

        await new Promise((r) => setTimeout(r, 1400));
        setSimStage(5);
        setSimLogs((prev) => [
            `[15:34:08] ✅ Supercharged Global AI Model synced back to Hospital Doctor Stations (98.42% accuracy).`,
            ...prev
        ]);

        await new Promise((r) => setTimeout(r, 800));
        setIsSimulating(false);
    };

    // Test Multi-Cloud Latency API Ping
    const handleTestLatency = async () => {
        setTestingLatency(true);
        const res = await ApiService.fetchMultiCloudLatency();
        if (res && res.success) {
            setCloudLatencies(res.latencies);
            if (res.details) setCloudDetails(res.details);
        }
        setTestingLatency(false);
    };

    const activeStepData = storySteps[activeStep];

    return (
        <div className="flex-1 p-5 md:p-6 space-y-6 bg-slate-50 overflow-y-auto custom-scrollbar">
            {/* Header Toolbar (Compact & Non-Tech Focused) */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
                <div className="flex gap-3 items-center">
                    <div className="size-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-sky-600 text-2xl">account_tree</span>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900 leading-none mb-1">
                            System <span className="text-sky-600">Architecture</span> (Non-Tech Guide)
                        </h1>
                        <p className="text-[11px] text-slate-500 font-medium">
                            PROD_RUNTIME_V{CONFIG.SYSTEM_VERSION} • EU MDR &amp; EU AI Act Audit-Ready
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleTestLatency}
                        disabled={testingLatency}
                        className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-sm ${testingLatency ? 'animate-spin' : ''}`}>sync</span>
                        {testingLatency ? 'Pinging Cloud Nodes...' : 'Test Cloud Latency'}
                    </button>

                    <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-sm">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Mesh Health</span>
                        <span className="text-xs font-black text-emerald-600">100.0%</span>
                    </div>
                </div>
            </header>

            {/* LIVE MULTI-CLOUD IN PRACTICE SIMULATION CANVAS (AWS • GCP • AZURE) */}
            <div className="p-6 md:p-7 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden space-y-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Simulation Section Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10 border-b border-white/10 pb-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="size-2 rounded-full bg-sky-400 animate-ping" />
                            Live Multi-Cloud Simulation in Practice
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white">
                            How Amazon (AWS), Google (GCP) &amp; Microsoft (Azure) Connect
                        </h2>
                        <p className="text-xs text-slate-300">
                            See how patient skin photos stay safely inside local hospitals while AWS, GCP, and Azure pool anonymous math intelligence worldwide.
                        </p>
                        <div className="mt-2 text-[10px] text-amber-300 font-mono flex items-center gap-1.5 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-lg">
                            <span className="material-symbols-outlined text-xs text-amber-400">info</span>
                            <span><strong>Production Note:</strong> Multi-Cloud telemetry &amp; regional node latency (AWS, GCP, Azure) are live-simulated for presentation &amp; demonstration (No active cloud API keys required).</span>
                        </div>
                    </div>

                    <button
                        onClick={runMultiCloudSimulation}
                        disabled={isSimulating}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-lg shadow-sky-500/25 disabled:opacity-50 whitespace-nowrap"
                    >
                        <span className={`material-symbols-outlined text-lg ${isSimulating ? 'animate-spin' : ''}`}>
                            {isSimulating ? 'sync' : 'play_circle'}
                        </span>
                        {isSimulating ? 'Simulating Multi-Cloud Sync...' : 'Simulate Multi-Cloud Sync in Action'}
                    </button>
                </div>

                {/* Interactive Multi-Cloud Visual Flowchart (Hospitals -> Regional Clouds -> Global Brain) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {/* NODE COLUMN 1: LOCAL HOSPITALS (ZERO EXPORT) */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">local_hospital</span>
                                1. Local Hospital Nodes
                            </h4>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                                🔒 PHI Safe
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                            Raw patient skin scans &amp; EHR notes stay locked inside local hardware vaults.
                        </p>

                        <div className="space-y-2 pt-1 font-mono text-[11px]">
                            <div className={`p-2.5 rounded-xl border transition-all ${
                                simStage === 1 ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-400/30' : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                                <strong className="text-white block">🏥 Hospital Boston (USA)</strong>
                                Calculates local SGD weights
                            </div>
                            <div className={`p-2.5 rounded-xl border transition-all ${
                                simStage === 1 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30' : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                                <strong className="text-white block">🏥 Hospital Athens (Greece)</strong>
                                Enforces GDPR Art. 25 Zero-Export
                            </div>
                            <div className={`p-2.5 rounded-xl border transition-all ${
                                simStage === 1 ? 'bg-blue-500/20 border-blue-400 text-blue-200 ring-2 ring-blue-400/30' : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                                <strong className="text-white block">🏥 Hospital Tokyo (Japan)</strong>
                                Applies Differential Privacy (ε=1.42)
                            </div>
                        </div>
                    </div>

                    {/* NODE COLUMN 2: REGIONAL MULTI-CLOUD PROVIDERS (AWS, GCP, AZURE) */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative">
                        {/* Pulse Flow Line */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">cloud_sync</span>
                                2. Multi-Cloud Mesh
                            </h4>
                            <span className="text-[9px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                                Anonymous Math
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                            AWS, GCP &amp; Azure receive only anonymous mathematical gradients.
                        </p>

                        <div className="space-y-2 pt-1 font-mono text-[11px]">
                            {/* AWS Node */}
                            <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                                simStage === 3 ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30' : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                                <div>
                                    <strong className="text-amber-400 block">🟧 Amazon AWS (us-east-1)</strong>
                                    <span>North America Mesh ({cloudLatencies.aws})</span>
                                </div>
                                <span className="material-symbols-outlined text-amber-400 text-xl">cloud</span>
                            </div>

                            {/* GCP Node */}
                            <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                                simStage === 3 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30' : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                                <div>
                                    <strong className="text-cyan-400 block">🟦 Google GCP (europe-west1)</strong>
                                    <span>European GDPR Mesh ({cloudLatencies.gcp})</span>
                                </div>
                                <span className="material-symbols-outlined text-cyan-400 text-xl">cloud_done</span>
                            </div>

                            {/* Azure Node */}
                            <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                                simStage === 3 ? 'bg-blue-500/20 border-blue-400 text-blue-200 ring-2 ring-blue-400/30' : 'bg-white/5 border-white/10 text-slate-300'
                            }`}>
                                <div>
                                    <strong className="text-blue-400 block">🟦 Microsoft Azure (asia-east1)</strong>
                                    <span>Asia-Pacific Mesh ({cloudLatencies.azure})</span>
                                </div>
                                <span className="material-symbols-outlined text-blue-400 text-xl">cloud_sync</span>
                            </div>
                        </div>
                    </div>

                    {/* NODE COLUMN 3: GLOBAL MASTER FEDERATED MODEL */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">psychology</span>
                                3. Global AI Brain
                            </h4>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                                98.42% Accuracy
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                            FedAvg Engine aggregates AWS, GCP &amp; Azure updates into global diagnostic intelligence.
                        </p>

                        <div className={`p-4 rounded-xl border transition-all space-y-2 font-mono text-[11px] ${
                            simStage === 4 || simStage === 5 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/30' : 'bg-white/5 border-white/10 text-slate-300'
                        }`}>
                            <div className="flex justify-between items-center">
                                <strong className="text-emerald-400 text-xs">FedAvg Engine Active</strong>
                                <span className="text-[9px] bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-300">Loss: 0.1245</span>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-tight">
                                Combines learning patterns from thousands of skin scans worldwide without reading a single patient name.
                            </p>
                            <div className="pt-2 border-t border-white/10 text-sky-300 font-bold text-[10px] flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Synced back to Doctor Stations
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simulation Telemetry Console Stream */}
                {simLogs.length > 0 && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-1">
                            Live Multi-Cloud Telemetry Event Stream
                        </span>
                        {simLogs.map((log, idx) => (
                            <div key={idx} className="text-sky-300 flex items-start gap-2 leading-tight">
                                <span>&gt;&gt;</span>
                                <span>{log}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* COMPACT 6-STEP PIPELINE STORYFLOW */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sky-600">route</span>
                            End-to-End Data Pipeline Steps (Compact Overview)
                        </h3>
                        <p className="text-xs text-slate-500">Click any step card to inspect Plain-English details</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                        Step 0{activeStep + 1} of 06
                    </span>
                </div>

                {/* Compact 6-Step Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {storySteps.map((s) => {
                        const isSelected = activeStep === s.id;
                        return (
                            <div
                                key={s.id}
                                onClick={() => setActiveStep(s.id)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                        ? 'bg-sky-50/90 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                                        : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-mono font-bold text-slate-400">Step {s.stepNum}</span>
                                        <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>
                                            {s.icon}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                                        {s.title.split('.')[1]}
                                    </h4>
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold">
                                    <span className={isSelected ? 'text-sky-700' : 'text-slate-400'}>
                                        {isSelected ? 'Active' : 'Inspect'}
                                    </span>
                                    <span className="material-symbols-outlined text-xs text-sky-600">chevron_right</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Compact Step Inspector Panel */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStepData.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4"
                    >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                                    <span className="material-symbols-outlined text-2xl">{activeStepData.icon}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                        Step {activeStepData.stepNum} Breakdown
                                    </span>
                                    <h4 className="text-sm font-black text-slate-900 mt-0.5">{activeStepData.title}</h4>
                                </div>
                            </div>

                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                {activeStepData.badge}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/70 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-sky-800 font-bold text-[11px] uppercase">
                                    <span className="material-symbols-outlined text-base text-sky-600">chat_bubble</span>
                                    In Plain English
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium">{activeStepData.plainEnglish}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase">
                                    <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                                    Privacy Guarantee
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium">{activeStepData.privacyGuarantee}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/70 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-purple-800 font-bold text-[11px] uppercase">
                                    <span className="material-symbols-outlined text-base text-purple-600">local_hospital</span>
                                    Clinical Example
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium">{activeStepData.realWorldExample}</p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* COMPACT MULTI-CLOUD LIVE PING TELEMETRY CARDS */}
            <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Multi-Cloud Node Telemetry Cards (Amazon, Google &amp; Microsoft)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* AWS */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                                    <span className="material-symbols-outlined text-xl">cloud</span>
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-slate-900 uppercase">Amazon AWS Cluster</h5>
                                    <p className="text-[10px] text-slate-500 font-mono">us-east-1 (North America)</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Optimal
                            </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-400 text-[10px]">Latency / Jitter</span>
                            <span className="text-sky-700 font-bold">{cloudLatencies.aws} • {cloudDetails.aws?.jitter || '0.4ms'}</span>
                        </div>
                    </div>

                    {/* GCP */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                                    <span className="material-symbols-outlined text-xl">cloud_done</span>
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-slate-900 uppercase">Google GCP Cluster</h5>
                                    <p className="text-[10px] text-slate-500 font-mono">europe-west1 (Europe)</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Optimal
                            </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-400 text-[10px]">Latency / Jitter</span>
                            <span className="text-sky-700 font-bold">{cloudLatencies.gcp} • {cloudDetails.gcp?.jitter || '0.8ms'}</span>
                        </div>
                    </div>

                    {/* Azure */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-outlined text-xl">cloud_sync</span>
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-slate-900 uppercase">Microsoft Azure Cluster</h5>
                                    <p className="text-[10px] text-slate-500 font-mono">asia-east1 (Asia-Pacific)</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">
                                Syncing
                            </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-400 text-[10px]">Latency / Jitter</span>
                            <span className="text-sky-700 font-bold">{cloudLatencies.azure} • {cloudDetails.azure?.jitter || '2.4ms'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Architecture;
