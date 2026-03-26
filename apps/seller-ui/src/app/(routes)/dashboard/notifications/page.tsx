"use client";

import React from "react";
import Box from "@/shared/components/box";
import { useNotifications } from "@/hooks/useNotifications";
import { CheckCircle2, Info, AlertTriangle, XCircle, BellOff } from "lucide-react";

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

    const getIcon = (type: string) => {
        switch (type) {
            case "SUCCESS": return <CheckCircle2 className="text-green-500" size={20} />;
            case "WARNING": return <AlertTriangle className="text-yellow-500" size={20} />;
            case "ERROR": return <XCircle className="text-red-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    return (
        <Box css={{ padding: "24px" }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                    <p className="text-gray-400">Stay updated with your store activities</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={() => markAllAsRead()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-slate-900 rounded-xl border border-slate-800">
                    <BellOff size={48} className="text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                notification.isRead 
                                    ? "bg-slate-900/50 border-slate-800 opacity-75" 
                                    : "bg-slate-900 border-blue-500/30 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)] shadow-blue-500/20"
                            }`}
                        >
                            <div className="mt-1">{getIcon(notification.type)}</div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-white">{notification.title}</h3>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(notification.createdAt))}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-3">{notification.message}</p>
                                {!notification.isRead && (
                                    <button 
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Box>
    );
};

export default NotificationPage;
