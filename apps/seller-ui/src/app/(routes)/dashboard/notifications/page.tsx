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
        <Box css={{ padding: "32px", minHeight: "100vh", backgroundColor: "#020617" }}>
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Bell className="text-blue-400" size={24} />
                            </div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">Notifications</h1>
                        </div>
                        <p className="text-slate-400 text-lg">Manage your store alerts and activity stream.</p>
                    </motion.div>
                    
                    <AnimatePresence>
                        {notifications.length > 0 && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => markAllAsRead()}
                                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 border border-slate-700/50 px-6 py-3 rounded-2xl text-sm font-semibold transition-all backdrop-blur-xl group"
                            >
                                <CheckSquare className="group-hover:text-blue-400 transition-colors" size={18} />
                                Dismiss All
                            </motion.button>
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
                        <p className="text-slate-500 font-medium animate-pulse">Syncing notifications...</p>
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
                        <h2 className="text-2xl font-bold text-white mb-2">All caught up!</h2>
                        <p className="text-slate-500 text-center max-w-sm">
                            Your inbox is clear. We'll notify you here when there's new activity in your store.
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
                                            // delay: index * 0.05,
                                            ease: [0.23, 1, 0.32, 1]
                                        }}
                                        className={`group relative flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300 ${styles.border} bg-gradient-to-br ${styles.bg} hover:border-blue-500/30 hover:shadow-2xl ${styles.shadow} backdrop-blur-md overflow-hidden`}
                                    >
                                        {/* Background Glow */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <div className={`mt-1 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 group-hover:scale-110 transition-transform duration-300`}>
                                            {styles.icon}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <h3 className="font-bold text-lg text-slate-100 tracking-tight leading-none group-hover:text-white transition-colors">
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-800/50 px-3 py-1 rounded-full">
                                                    {formatDistanceToNow(new Date(notification.createdAt))}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-base leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                                                {notification.message}
                                            </p>
                                            
                                            <div className="flex items-center gap-4">
                                                <motion.button 
                                                    whileHover={{ x: 2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-blue-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                    Dismiss
                                                </motion.button>
                                            </div>
                                        </div>
                                        
                                        {/* Activity Indicator for Unread (Even though we delete, we might still show them briefly) */}
                                        {!notification.isRead && (
                                            <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
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
