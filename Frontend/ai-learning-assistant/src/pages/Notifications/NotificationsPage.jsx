import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import progressService from "../../services/progressService";
import { Bell, FileText, HelpCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";

const NotificationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await progressService.getDashboardData();
                if (response.success && response.data?.recentActivity) {
                    const storedRead = JSON.parse(localStorage.getItem('readNotifications') || '[]');

                    const docs = (response.data.recentActivity.documents || []).map(doc => ({
                        id: `doc_${doc._id}`,
                        type: 'document',
                        title: 'Document Uploaded',
                        message: `You uploaded a new document: "${doc.title}"`,
                        time: doc.createdAt || new Date(),
                        link: `/documents/${doc._id}`,
                        icon: FileText,
                        color: 'text-blue-500 bg-blue-50',
                        read: storedRead.includes(`doc_${doc._id}`)
                    }));
                    
                    const quizzes = (response.data.recentActivity.quizzes || []).map(quiz => ({
                        id: `quiz_${quiz._id}`,
                        type: 'quiz',
                        title: 'Quiz Completed',
                        message: `You scored ${quiz.score}% on the quiz "${quiz.title}"`,
                        time: quiz.completedAt || quiz.createdAt || new Date(),
                        link: quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`,
                        icon: HelpCircle,
                        color: 'text-emerald-500 bg-emerald-50',
                        read: storedRead.includes(`quiz_${quiz._id}`)
                    }));

                    const welcome = [{
                        id: 'welcome',
                        type: 'system',
                        title: 'Welcome to AI Learning Assistant',
                        message: `Glad to have you here, ${user?.username || 'Learner'}! Start by uploading your first document to generate AI study materials.`,
                        time: new Date(Date.now() - 86400000), // 1 day ago
                        link: '/documents',
                        icon: Bell,
                        color: 'text-primary bg-orange-50',
                        read: true
                    }];

                    // Combine and sort by time, newest first
                    const allNotifs = [...docs, ...quizzes, ...welcome].sort((a, b) => new Date(b.time) - new Date(a.time));
                    setNotifications(allNotifs);
                }
            } catch (error) {
                console.error("Failed to load notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        const readIds = notifications.map(n => n.id);
        const stored = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        localStorage.setItem('readNotifications', JSON.stringify([...new Set([...stored, ...readIds])]));
        window.dispatchEvent(new Event('notificationsRead'));
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        const stored = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        if (!stored.includes(id)) {
            localStorage.setItem('readNotifications', JSON.stringify([...stored, id]));
            window.dispatchEvent(new Event('notificationsRead'));
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500">Stay updated with your latest study activities</p>
                    </div>
                </div>
                <button 
                    onClick={markAllAsRead}
                    className="text-sm font-semibold text-primary hover:text-orange-600 flex items-center gap-1.5 px-4 py-2 bg-orange-50 rounded-lg transition-colors"
                >
                    <CheckCircle2 size={16} /> Mark all as read
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => {
                            const Icon = notif.icon;
                            return (
                                <Link 
                                    key={notif.id} 
                                    to={notif.link}
                                    onClick={() => markAsRead(notif.id)}
                                    className={`flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors block ${notif.read ? 'opacity-70' : 'bg-blue-50/10'}`}
                                >
                                    <div className={`p-3 rounded-full shrink-0 ${notif.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className={`text-sm font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                                                {moment(notif.time).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {notif.message}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-1.5 shadow-sm shadow-primary/40"></div>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <Bell size={28} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
                        <p className="text-gray-500 max-w-sm mb-6">When you upload documents or complete quizzes, your activity will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
