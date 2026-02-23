import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import Predictor from './components/Predictor';
import FLSimulation from './components/FLSimulation';
import Architecture from './components/Architecture';
import ClinicalData from './components/ClinicalData';
import SystemConfig from './components/SystemConfig';
import LandingPage from './components/LandingPage';
import { CONFIG } from './config';
import axios from 'axios';

const App = () => {
    const [hasEntered, setHasEntered] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE}/notifications`);
            if (response.data.success) {
                setNotifications(response.data.alerts);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.post(`${CONFIG.API_BASE}/notifications/read/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const clearAllNotifications = async () => {
        try {
            // Ideally backend would have a bulk read, but we can loop or just trigger individual ones
            await Promise.all(notifications.map(n => axios.post(`${CONFIG.API_BASE}/notifications/read/${n.id}`)));
            fetchNotifications();
        } catch (err) {
            console.error("Failed to clear notifications", err);
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Command Center', icon: 'dashboard' },
        { id: 'predictor', label: 'Predictor Hub', icon: 'biotech' },
        { id: 'simulation', label: 'FL Mesh', icon: 'hub' },
        { id: 'architecture', label: 'Architecture', icon: 'account_tree' },
        { id: 'data', label: 'Clinical Data', icon: 'database' },
        { id: 'settings', label: 'System Config', icon: 'settings' },
    ];

    if (!hasEntered) {
        return <LandingPage onEnter={() => setHasEntered(true)} />;
    }

    return (
        <div className="font-display text-slate-100 min-h-screen flex overflow-hidden bg-slate-950">
            {/* Sidebar Navigation */}
            <aside className={`transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-24'} flex-shrink-0 border-r border-white/5 flex flex-col glass-panel z-50 bg-black/20`}>
                <div className="p-8 border-b border-white/5 flex items-center gap-4 overflow-hidden">
                    <div className="relative group flex-shrink-0">
                        {/* Shimmer Atmosphere */}
                        <motion.div
                            animate={{
                                opacity: [0.2, 0.4, 0.2],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                        />
                        <motion.img
                            src="/assets/logoo.png"
                            alt="DermaGnosis Logo"
                            animate={{
                                y: [0, -3, 0],
                                filter: ["drop-shadow(0 0 0px rgba(0,242,254,0))", "drop-shadow(0 0 12px rgba(0,242,254,0.3))", "drop-shadow(0 0 0px rgba(0,242,254,0))"]
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="size-14 object-contain relative z-10 p-1 filter contrast-125 brightness-110"
                        />
                    </div>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col justify-center"
                        >
                            <h1 className="text-slate-100 font-black tracking-[0.15em] text-xl leading-none mb-1 uppercase group-hover:text-primary transition-colors">DermaGnosis</h1>
                            <p className="text-primary/40 text-[9px] uppercase tracking-[0.4em] font-black whitespace-nowrap">Integrated Med-AI Hub</p>
                        </motion.div>
                    )}
                </div>

                <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`px-4 py-3.5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all group relative overflow-hidden ${activeTab === item.id
                                ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5'
                                : 'text-slate-500 hover:bg-white/5 hover:text-slate-100 border border-transparent'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-2xl ${activeTab === item.id ? 'glow-primary' : 'group-hover:text-primary'} transition-all`}>
                                {item.icon}
                            </span>
                            {isSidebarOpen && (
                                <span className={`text-xs tracking-[0.1em] uppercase ${activeTab === item.id ? 'font-black' : 'font-bold'}`}>
                                    {item.label}
                                </span>
                            )}
                            {activeTab === item.id && (
                                <motion.div layoutId="nav-glow" className="absolute left-0 w-1 h-6 bg-primary rounded-full" />
                            )}
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 bg-black/20">
                    {isSidebarOpen ? (
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Neural Load</span>
                                <span className="text-[10px] text-primary font-black uppercase">Optimized</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-primary h-full shadow-[0_0_10px_#06f9f9]" style={{ width: '42%' }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center p-2 text-slate-500 hover:text-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">memory</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="mt-6 w-full flex items-center justify-center p-3 text-slate-600 hover:text-white transition-colors glass-panel rounded-xl border-white/5"
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

                {/* Header HUD */}
                <header className="h-20 border-b border-white/5 glass-panel flex items-center justify-between px-10 z-40 bg-black/10">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                System Status: <span className="text-slate-100">{CONFIG.SYSTEM_VERSION}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-3 text-slate-500 hover:text-primary transition-colors relative"
                            >
                                <span className="material-symbols-outlined">notifications_active</span>
                                {notifications.length > 0 && (
                                    <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-4 w-80 glass-panel border border-white/10 rounded-2xl shadow-2xl p-4 z-50 bg-slate-900/90"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Alerts</span>
                                            <button
                                                onClick={clearAllNotifications}
                                                className="text-[9px] text-primary font-bold hover:underline"
                                            >Clear All</button>
                                        </div>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                            {notifications.length === 0 ? (
                                                <div className="text-[10px] text-slate-500 italic text-center py-4">No active alerts.</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => markAsRead(n.id)}
                                                        className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className={`text-[8px] font-black uppercase tracking-tighter ${n.type === 'urgent' ? 'text-red-400' : 'text-primary'}`}>
                                                                {n.type}
                                                            </span>
                                                            <span className="text-[8px] text-slate-600 font-mono">{n.time}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-200 font-bold group-hover:text-primary transition-colors">{n.msg}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <div className="hidden sm:block text-right">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1 italic">Radiologist Pool</p>
                                <p className="text-xs font-black text-slate-100 tracking-tight">Dr. Elena Vance</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Admin Station 01</p>
                            </div>
                            <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-slate-800 p-0.5 border border-white/10 relative group cursor-pointer shadow-lg shadow-primary/5 hover:scale-105 transition-all">
                                <img
                                    src="/assets/doctor_profile.png"
                                    alt="Doctor Profile"
                                    className="h-full w-full rounded-[0.9rem] object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[10px] text-white">verified_user</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Router */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="scanline z-50"></div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, filter: 'blur(20px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.02, filter: 'blur(20px)' }}
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            className="h-full w-full overflow-y-auto custom-scrollbar"
                        >
                            {activeTab === 'dashboard' && <Dashboard />}
                            {activeTab === 'predictor' && <Predictor />}
                            {activeTab === 'simulation' && <FLSimulation />}
                            {activeTab === 'architecture' && <Architecture />}
                            {activeTab === 'data' && <ClinicalData />}
                            {activeTab === 'settings' && <SystemConfig />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default App;
