"use client";

import React from "react";
import Box from "@/shared/components/box";
import { useNotifications } from "@/hooks/useNotifications";
import { 
    CheckCircle2, 
    Info, 
    AlertTriangle, 
    XCircle, 
    BellOff, 
    Trash2, 
    CheckSquare,
    Bell,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui";

const formatDistanceToNow = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
};

const NotificationPage = () => {
    const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();

    const getStyles = (type: string) => {
        switch (type) {
            case "SUCCESS": return {
                icon: <CheckCircle2 className="text-emerald-400" size={20} />,
                bg: "from-emerald-500/10 to-transparent",
                border: "border-emerald-500/20",
                shadow: "shadow-emerald-500/5",
                accent: "text-emerald-400"
            };
            case "WARNING": return {
                icon: <AlertTriangle className="text-amber-400" size={20} />,
                bg: "from-amber-500/10 to-transparent",
                border: "border-amber-500/20",
                shadow: "shadow-amber-500/5",
                accent: "text-amber-400"
            };
            case "ERROR": return {
                icon: <XCircle className="text-rose-400" size={20} />,
                bg: "from-rose-500/10 to-transparent",
                border: "border-rose-500/20",
                shadow: "shadow-rose-500/5",
                accent: "text-rose-400"
            };
            default: return {
                icon: <Info className="text-sky-400" size={20} />,
                bg: "from-sky-500/10 to-transparent",
                border: "border-sky-500/20",
                shadow: "shadow-sky-500/5",
                accent: "text-sky-400"
            };
        }
    };

    return (
        <Box css={{ padding: "32px", minHeight: "100vh", backgroundColor: "#020617" }} className="relative overflow-hidden">
            {/* Background Accent Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] pointer-events-none rounded-full" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border border-blue-500/20 backdrop-blur-md">
                                Administrative Control
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
                                Master Stream
                            </span>
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.85] mb-4">
                            System <span className="text-blue-500/80">Alerts</span>
                        </h1>
                        <p className="text-slate-500 font-medium italic text-lg opacity-70">
                            Orchestrating system-wide events & administrative logs
                        </p>
                    </motion.div>
                    
                    <AnimatePresence>
                        {notifications.length > 0 && (
                            <Button 
                                onClick={() => markAllAsRead()}
                                variant="blue"
                                fullWidth={false}
                                className="!rounded-[2rem] !px-8 !py-4 backdrop-blur-2xl !bg-white/5 hover:!bg-white/10 !border-white/10 shadow-2xl group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CheckSquare className="group-hover:text-blue-400 transition-colors relative z-10" size={18} />
                                <span className="relative z-10">Clear Status Feed</span>
                            </Button>
                        )}
                    </AnimatePresence>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-96 gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="text-blue-400/50" size={20} />
                            </div>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing system stream...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 px-6 bg-slate-900/30 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-sm"
                    >
                        <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mb-6">
                            <BellOff size={40} className="text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 italic">Systems Green</h2>
                        <p className="text-slate-500 text-center max-w-sm italic">
                            All systems are functioning nominally. There are no pending administrative alerts at this time.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {notifications.map((notification, index) => {
                                const styles = getStyles(notification.type);
                                return (
                                    <motion.div 
                                        key={notification.id}
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                                        transition={{ 
                                            duration: 0.4, 
                                            ease: [0.23, 1, 0.32, 1]
                                        }}
                                        className={`group relative flex items-start gap-5 p-6 rounded-[2.5rem] border transition-all duration-500 ${styles.border} bg-gradient-to-br ${styles.bg} hover:border-blue-500/30 hover:shadow-2xl ${styles.shadow} backdrop-blur-md overflow-hidden`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <div className={`mt-1 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 group-hover:scale-110 transition-transform duration-300`}>
                                            {styles.icon}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <h3 className="font-bold text-xl text-slate-100 tracking-tight leading-none group-hover:text-white transition-colors italic uppercase">
                                                    {notification.title}
                                                </h3>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/20">
                                                    {formatDistanceToNow(new Date(notification.createdAt))}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-base leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                                                {notification.message}
                                            </p>
                                            
                                            <div className="flex items-center gap-4">
                                                <Button 
                                                    onClick={() => markAsRead(notification.id)}
                                                    variant="rose"
                                                    glow={false}
                                                    fullWidth={false}
                                                    className="!bg-transparent !border-none !p-0 !h-auto !text-xs !font-black !text-slate-400 hover:!text-rose-400 !tracking-widest"
                                                >
                                                    <Trash2 size={14} className="mr-2" />
                                                    Dismiss Log
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {!notification.isRead && (
                                            <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </Box>
    );
};

export default NotificationPage;
