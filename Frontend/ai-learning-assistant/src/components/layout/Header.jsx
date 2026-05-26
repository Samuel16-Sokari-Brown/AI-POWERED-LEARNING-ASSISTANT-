import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Bell, Search, Menu } from "lucide-react";
import { BASE_URL } from "../../utils/apiPath";
import progressService from "../../services/progressService";

const Header = ({ onMenuClick }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [hasUnread, setHasUnread] = useState(false);

    const checkUnread = async () => {
        try {
            const response = await progressService.getDashboardData();
            if (response.success && response.data?.recentActivity) {
                const storedRead = JSON.parse(localStorage.getItem('readNotifications') || '[]');
                
                const docIds = (response.data.recentActivity.documents || []).map(doc => `doc_${doc._id}`);
                const quizIds = (response.data.recentActivity.quizzes || []).map(quiz => `quiz_${quiz._id}`);
                const welcomeId = 'welcome';
                
                const allIds = [...docIds, ...quizIds, welcomeId];
                const hasUnreadNotif = allIds.some(id => !storedRead.includes(id));
                setHasUnread(hasUnreadNotif);
            }
        } catch (error) {
            console.error("Failed to check notifications", error);
        }
    };

    React.useEffect(() => {
        if (user) {
            checkUnread();
        }
    }, [user, location.pathname]);

    React.useEffect(() => {
        const handleReadEvent = () => checkUnread();
        window.addEventListener('notificationsRead', handleReadEvent);
        return () => window.removeEventListener('notificationsRead', handleReadEvent);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/documents?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };
    
    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 transition-all">
            <div className="flex items-center gap-4 flex-1">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for documents..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder-gray-400 text-slate-700"
                    />
                </form>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
                <Link to="/notifications" className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                    <Bell size={20} />
                    {hasUnread && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                    )}
                </Link>

                <div className="flex items-center gap-3 pl-3 md:pl-5 border-l border-slate-200 cursor-pointer group">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-500 transition-colors">
                            {user?.username || "User"}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Student</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 text-white flex items-center justify-center font-bold shadow-md shrink-0 overflow-hidden">
                        {user?.profilePicture ? (
                            <img src={`${BASE_URL}${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.username ? user.username[0].toUpperCase() : "U"
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
