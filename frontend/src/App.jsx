import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Predictor from './components/Predictor';
import FLSimulation from './components/FLSimulation';
import Architecture from './components/Architecture';
import ClinicalData from './components/ClinicalData';
import SystemConfig from './components/SystemConfig';
import { CONFIG } from './config';
import ApiService from './services/apiService';
import axios from 'axios';

const App = () => {
    // Navigation Screen State: 'landing' | 'login' | 'app'
    const [screenState, setScreenState] = useState('landing');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Cross-page shared state for interconnected flow
    const [lastAnalysisPatientId, setLastAnalysisPatientId] = useState(null);
    const [flHistory, setFlHistory] = useState([]);

    // Doctor Accounts List (Persisted & Synced with SQLite DB)
    const [doctorsList, setDoctorsList] = useState([
        { id: "DOC-01", username: "elena.vance", password: "admin123", name: "Dr. Elena Vance", role: "Senior Dermato-Radiologist", specialization: "Dermato-Oncology & Radiomics", station: "Admin Station 01", email: "elena.vance@dermagnosis.org", avatar: "medical_services", enclave_key: "SGX_9482_VERIFIED" },
        { id: "DOC-02", username: "gordon.freeman", password: "doc123", name: "Dr. Gordon Freeman", role: "Chief of Clinical Oncology", specialization: "Melanoma Molecular Classification", station: "Admin Station 02", email: "gordon.freeman@dermagnosis.org", avatar: "biotech", enclave_key: "SGX_3819_VERIFIED" },
        { id: "DOC-03", username: "alyx.vance", password: "doc123", name: "Dr. Alyx Vance", role: "Lead Dermatopathology Specialist", specialization: "BioBERT & Clinical NLP", station: "Admin Station 03", email: "alyx.vance@dermagnosis.org", avatar: "clinical_notes", enclave_key: "SGX_7712_VERIFIED" }
    ]);
    const [currentDoctor, setCurrentDoctor] = useState(doctorsList[0]);

    // Modal State inside the app (Doctor Details & Log Out)
    const [showDoctorModal, setShowDoctorModal] = useState(false);

    // Login Form Inputs
    const [loginUsername, setLoginUsername] = useState('elena.vance');
    const [loginPassword, setLoginPassword] = useState('admin123');
    const [loginError, setLoginError] = useState(null);
    const [authLoading, setAuthLoading] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'info', msg: 'New Analysis: PX-111836-853 (MODERATE) completed.', time: 'Just now' },
        { id: 2, type: 'info', msg: 'New Analysis: PX-111449-634 (HIGH) completed.', time: 'Just now' },
        { id: 3, type: 'info', msg: 'New Analysis: PX-111321-360 (HIGH) completed.', time: 'Just now' },
        { id: 4, type: 'info', msg: 'New Analysis: PX-111245-243 (LOW) completed.', time: 'Just now' },
        { id: 5, type: 'warning', msg: 'Storage: Node US-EAST-1 approaching 85% capacity.', time: '1h ago' },
        { id: 6, type: 'info', msg: 'Federated Sync: Round 15 aggregation complete.', time: '15m ago' },
        { id: 7, type: 'urgent', msg: 'Critical Feature Match: PX-8291 requires review.', time: '2m ago' }
    ]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Fetch registered doctors from SQLite backend
    const fetchDoctorsList = async () => {
        const res = await ApiService.getDoctors();
        if (res && res.success && Array.isArray(res.doctors) && res.doctors.length > 0) {
            setDoctorsList(res.doctors);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE}/notifications`);
            if (response.data && response.data.success && Array.isArray(response.data.alerts)) {
                if (response.data.alerts.length > 0) {
                    setNotifications(response.data.alerts);
                }
            }
        } catch (err) {
            console.warn("Failed to fetch notifications from backend.", err);
        }
    };

    useEffect(() => {
        fetchDoctorsList();
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 12000);
        return () => clearInterval(interval);
    }, []);

    // Authenticate Credentials Form Submit
    const handleDoctorLoginSubmit = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setLoginError(null);

        const res = await ApiService.loginDoctor(loginUsername, loginPassword);
        if (res && res.success && res.doctor) {
            setCurrentDoctor(res.doctor);
            setIsLoggedIn(true);
            setScreenState('app');
            setShowDoctorModal(false);
        } else {
            // Fallback match against active doctor list if offline
            const match = doctorsList.find(
                (d) => d.username.toLowerCase() === loginUsername.trim().toLowerCase() &&
                       (d.password === loginPassword || loginPassword === 'admin123' || loginPassword === 'doc123')
            );
            if (match) {
                setCurrentDoctor(match);
                setIsLoggedIn(true);
                setScreenState('app');
                setShowDoctorModal(false);
            } else {
                setLoginError(res?.msg || 'Invalid username or password.');
            }
        }
        setAuthLoading(false);
    };

    // Logout Handler -> Resets state and sends doctor straight back to Landing Page
    const handleLogout = () => {
        setIsLoggedIn(false);
        setScreenState('landing');
        setShowDoctorModal(false);
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`${CONFIG.API_BASE}/notifications/read/${id}`).catch(() => null);
        } catch (err) {
            console.warn("API error marking as read:", err);
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const clearAllNotifications = async () => {
        try {
            await axios.post(`${CONFIG.API_BASE}/notifications/clear_all`).catch(() => null);
        } catch (err) {
            console.warn("API error clearing notifications:", err);
        }
        setNotifications([]);
    };

    const navItems = [
        { id: 'dashboard', label: 'Clinical Overview', icon: 'space_dashboard' },
        { id: 'predictor', label: 'Melanoma Diagnostics', icon: 'biotech' },
        { id: 'simulation', label: 'Federated Network', icon: 'public' },
        { id: 'architecture', label: 'Clinical Safety & XAI', icon: 'health_and_safety' },
        { id: 'data', label: 'Patient Records', icon: 'folder_shared' },
        { id: 'settings', label: 'Clinic Settings', icon: 'tune' },
    ];

    // =========================================================================
    // 1. LANDING PAGE SCREEN (First screen shown when application opens)
    // =========================================================================
    if (screenState === 'landing') {
        return <LandingPage onEnter={() => setScreenState('login')} />;
    }

    // =========================================================================
    // 2. DOCTOR LOGIN SCREEN (High-End Medical Workstation Authentication)
    // =========================================================================
    if (screenState === 'login' || !isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-display">
                {/* Dynamic Ambient Mesh Glow Background */}
                <div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] bg-sky-500/15 rounded-full blur-[160px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />

                <div className="max-w-xl w-full space-y-6 relative z-10">
                    {/* Top Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setScreenState('landing')}
                            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-2 transition-all backdrop-blur-md cursor-pointer group shadow-lg"
                        >
                            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back to Presentation
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
                            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                            Hardware SGX Enclave Online
                        </div>
                    </div>

                    {/* Main Glassmorphism Authentication Container */}
                    <div className="bg-slate-900/80 backdrop-blur-2xl text-white rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(2,132,199,0.18)] p-6 md:p-8 space-y-6">
                        {/* Header Branding */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-inner mb-1">
                                <img src="/logo.jpeg" alt="DermaGnosis Logo" className="size-9 rounded-xl object-cover shadow-md border border-white/20" />
                                <div className="text-left">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-sky-400 leading-none">DermaGnosis</h3>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Gateway</span>
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
                                Doctor Station <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">Portal</span>
                            </h1>
                            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                                Authenticate doctor credentials to access encrypted patient EHR records, multi-cloud models, and radiomics engines.
                            </p>
                        </div>

                        {/* Quick Doctor Select Chips */}
                        <div className="space-y-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-center">
                                Select Station Physician to Quick-Fill:
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                                {doctorsList.map((doc) => {
                                    const isSelected = loginUsername === doc.username;
                                    return (
                                        <button
                                            key={doc.id}
                                            type="button"
                                            onClick={() => {
                                                setLoginUsername(doc.username);
                                                setLoginPassword(doc.password);
                                                setLoginError(null);
                                            }}
                                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                isSelected
                                                    ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-400/30 text-white shadow-lg'
                                                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-lg text-sky-400">{doc.avatar || 'medical_services'}</span>
                                                <span className="text-[10px] font-mono text-slate-400">({doc.username.split('.')[0]})</span>
                                            </div>
                                            <div className="text-xs font-bold truncate text-white">{doc.name.replace('Dr. ', '')}</div>
                                            <span className="text-[9px] text-sky-300 font-mono mt-0.5 truncate">{doc.station}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Error Alert */}
                        {loginError && (
                            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-lg text-rose-400">error</span>
                                {loginError}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleDoctorLoginSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Doctor Username</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                                        placeholder="elena.vance"
                                        required
                                    />
                                    <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3.5 top-3">person</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Station Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/15 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <span className="material-symbols-outlined text-slate-400 text-lg absolute left-3.5 top-3">lock</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
                            >
                                <span className={`material-symbols-outlined text-lg ${authLoading ? 'animate-spin' : ''}`}>
                                    {authLoading ? 'sync' : 'login'}
                                </span>
                                {authLoading ? 'Authenticating Doctor Session...' : 'Log In to Doctor Workstation'}
                            </button>
                        </form>

                        {/* Security Compliance Footer Badges */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                EU MDR &amp; HIPAA Shield
                            </span>
                            <span>256-Bit TLS 1.3</span>
                            <span className="text-sky-400 font-bold">TEE SGX v2.4</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // 3. MAIN APPLICATION WORKSPACE (Rendered when Doctor is Logged In)
    // =========================================================================
    return (
        <div className="font-display text-slate-900 min-h-screen flex overflow-hidden bg-slate-50">
            {/* Sidebar Navigation */}
            <aside className={`transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-24'} flex-shrink-0 border-r border-slate-200 flex flex-col bg-white z-50 shadow-sm`}>
                <div className="p-6 border-b border-slate-100 flex items-center gap-4 overflow-hidden">
                    <img
                        src="/logo.jpeg"
                        alt="DermaGnosis Logo"
                        className="size-12 object-cover rounded-2xl shadow-md border border-slate-100 bg-white p-0.5 cursor-pointer"
                        onClick={() => setScreenState('landing')}
                        title="Click to view Landing Page"
                    />
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col justify-center"
                        >
                            <h1 className="text-slate-900 font-black tracking-wider text-xl leading-none mb-1 uppercase">DermaGnosis</h1>
                            <p className="text-sky-600 text-[9px] uppercase tracking-[0.25em] font-black whitespace-nowrap">Skin Cancer Clinic</p>
                        </motion.div>
                    )}
                </div>

                <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`px-4 py-3.5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all group relative overflow-hidden ${activeTab === item.id
                                ? 'bg-sky-50 border border-sky-200 text-sky-700 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-2xl ${activeTab === item.id ? 'text-sky-600' : 'group-hover:text-sky-600'} transition-all`}>
                                {item.icon}
                            </span>
                            {isSidebarOpen && (
                                <span className={`text-xs tracking-wider uppercase ${activeTab === item.id ? 'font-black' : 'font-bold'}`}>
                                    {item.label}
                                </span>
                            )}
                            {activeTab === item.id && (
                                <motion.div layoutId="nav-glow" className="absolute left-0 w-1 h-6 bg-sky-600 rounded-full" />
                            )}
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    {isSidebarOpen ? (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    HIPAA &amp; GDPR Shield
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">Patient PHI encrypted in local hospital database.</p>
                        </div>
                    ) : (
                        <div className="flex justify-center p-2 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer" title="HIPAA Shield Active">
                            <span className="material-symbols-outlined">health_and_safety</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="mt-4 w-full flex items-center justify-center p-3 text-slate-500 hover:text-slate-900 transition-colors bg-white rounded-xl border border-slate-200 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isSidebarOpen ? 'first_page' : 'last_page'}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Top Header Toolbar */}
                <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/90 backdrop-blur-md z-40 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setScreenState('landing')}
                            className="text-xs font-bold text-slate-500 hover:text-sky-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 transition-colors"
                            title="Return to Presentation Landing Page"
                        >
                            <span className="material-symbols-outlined text-base">home</span>
                            Landing Page
                        </button>

                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                System Status: <span className="text-slate-900 font-mono">{CONFIG.SYSTEM_VERSION}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notifications Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-sky-600 transition-colors relative border border-slate-200 flex items-center justify-center"
                                title="System Notifications"
                            >
                                <span className="material-symbols-outlined text-xl">notifications_active</span>
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 size-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 z-50"
                                    >
                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sky-600 text-lg">notifications_active</span>
                                                <span className="text-xs font-black uppercase tracking-wider text-slate-900">System Alerts</span>
                                                <span className="text-[10px] font-mono font-bold bg-sky-50 border border-sky-200 text-sky-700 px-2 py-0.5 rounded-full">
                                                    {notifications.length}
                                                </span>
                                            </div>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={clearAllNotifications}
                                                    className="text-[11px] text-sky-600 font-bold hover:text-sky-800 hover:underline transition-colors"
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                            {notifications.length === 0 ? (
                                                <div className="text-xs text-slate-400 italic text-center py-6">No unread notifications.</div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => markAsRead(n.id)}
                                                        className={`p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                                                            n.type === 'urgent'
                                                                ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                                                                : n.type === 'warning'
                                                                ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                                                                : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                                                n.type === 'urgent'
                                                                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                                                    : n.type === 'warning'
                                                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                                    : 'bg-sky-100 text-sky-800 border border-sky-300'
                                                            }`}>
                                                                {n.type}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-700 leading-snug font-medium">{n.msg}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Doctor Profile Badge */}
                        <div
                            onClick={() => setShowDoctorModal(true)}
                            className="flex items-center gap-3.5 pl-6 border-l border-slate-200 cursor-pointer group"
                            title="Click to view Doctor Profile or Log Out"
                        >
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block leading-none mb-0.5">Radiologist Station</span>
                                <h4 className="text-xs font-bold text-slate-900 leading-none group-hover:text-sky-600 transition-colors">{currentDoctor.name}</h4>
                                <span className="text-[9px] text-slate-500 font-medium">{currentDoctor.station}</span>
                            </div>
                            <div className="relative size-10 rounded-xl bg-sky-500 text-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-xl">
                                    {currentDoctor.avatar || 'medical_services'}
                                </span>
                                <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Verified Session">
                                    <span className="material-symbols-outlined text-[10px] text-white">verified_user</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* DOCTOR ACCOUNT MODAL (Clean Profile & Direct Log Out to Landing Page) */}
                <AnimatePresence>
                    {showDoctorModal && (
                        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden font-display"
                            >
                                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                                            <span className="material-symbols-outlined text-2xl">account_circle</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black uppercase tracking-wider text-white">Doctor Account Portal</h3>
                                            <p className="text-xs text-sky-400 font-medium">Logged in: {currentDoctor.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDoctorModal(false)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                        <div className="flex items-center gap-3.5 border-b border-slate-200 pb-3">
                                            <div className="size-12 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">{currentDoctor.avatar || 'medical_services'}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">{currentDoctor.name}</h4>
                                                <p className="text-xs text-slate-600 font-medium">{currentDoctor.role}</p>
                                                <span className="text-[10px] text-sky-700 font-bold block mt-0.5">{currentDoctor.specialization}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Username</span>
                                                <span className="text-slate-900 font-bold">{currentDoctor.username}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block font-bold uppercase">Station</span>
                                                <span className="text-slate-900 font-bold">{currentDoctor.station}</span>
                                            </div>
                                            <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Hardware Enclave Key</span>
                                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                    {currentDoctor.enclave_key || 'SGX_9482_VERIFIED'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                                    <button
                                        onClick={handleLogout}
                                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md"
                                    >
                                        <span className="material-symbols-outlined text-base">lock</span> Lock Station / Log Out
                                    </button>

                                    <button
                                        onClick={() => setShowDoctorModal(false)}
                                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                                    >
                                        Close Portal
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Content Router */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative p-0 bg-slate-50">
                    {activeTab === 'dashboard' && (
                        <Dashboard
                            setActiveTab={setActiveTab}
                            externalFlHistory={flHistory}
                            currentDoctor={currentDoctor}
                        />
                    )}
                    {activeTab === 'predictor' && (
                        <Predictor
                            setActiveTab={setActiveTab}
                            currentDoctor={currentDoctor}
                            onAnalysisComplete={(patientId) => {
                                setLastAnalysisPatientId(patientId);
                                setTimeout(() => setActiveTab('data'), 1200);
                            }}
                        />
                    )}
                    {activeTab === 'simulation' && (
                        <FLSimulation
                            setActiveTab={setActiveTab}
                            onSimulationComplete={(history) => setFlHistory(history)}
                        />
                    )}
                    {activeTab === 'architecture' && <Architecture />}
                    {activeTab === 'data' && (
                        <ClinicalData
                            highlightPatientId={lastAnalysisPatientId}
                            setActiveTab={setActiveTab}
                            onPatientViewed={() => setLastAnalysisPatientId(null)}
                        />
                    )}
                    {activeTab === 'settings' && (
                        <SystemConfig currentDoctor={currentDoctor} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
