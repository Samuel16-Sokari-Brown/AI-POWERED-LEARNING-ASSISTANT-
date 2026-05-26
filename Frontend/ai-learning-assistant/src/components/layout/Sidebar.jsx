import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Layers, HelpCircle, User, LogOut, BrainCircuit, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/apiPath";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { logout, user } = useAuth();
    
    const navItems = [
        { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
        { path: "/documents", name: "Documents", icon: FileText },
        { path: "/flashcards", name: "Flashcards", icon: Layers },
        { path: "/quizzes", name: "Quizzes", icon: HelpCircle },
        { path: "/profile", name: "Profile", icon: User },
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 shadow-xl flex flex-col z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
                <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <BrainCircuit className="text-emerald-500 w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span>AI<span className="text-emerald-500">Learner</span></span>
                </div>
                
                <button 
                    onClick={() => setIsOpen(false)}
                    className="md:hidden text-slate-400 hover:text-white p-1"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto hidden-scrollbar">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                                isActive 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm" 
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent"
                            }`}
                        >
                            {item.name === "Profile" && user?.profilePicture ? (
                                <img src={`${BASE_URL}${user.profilePicture}`} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                                <Icon size={20} className={isActive ? "text-emerald-400" : "text-slate-500"} />
                            )}
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800/80">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
