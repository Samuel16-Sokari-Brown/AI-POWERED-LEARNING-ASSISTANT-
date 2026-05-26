import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import progressService from "../../services/progressService";
import documentService from "../../services/documentService";
import quizService from "../../services/quizService";
import { FileText, Layers, HelpCircle, Trophy, Activity, ArrowRight, Loader2, Play, Trash2, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const DashboardPage = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);

    const fetchDashboard = async () => {
        try {
            const response = await progressService.getDashboardData();
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetProgress = async () => {
        if (window.confirm("Are you sure you want to reset your study stats? This will reset all your learned flashcard counts, quiz scores, and average score to 0. Your uploaded documents and generated materials will not be deleted.")) {
            setResetting(true);
            try {
                const res = await progressService.resetProgress();
                toast.success(res.message || "Your learning statistics have been successfully reset!");
                fetchDashboard();
            } catch (error) {
                toast.error(error.error || error.message || "Failed to reset learning statistics. Please try again.");
            } finally {
                setResetting(false);
            }
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleDeleteDocument = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this document? All associated flashcards and quizzes will also be removed.")) {
            try {
                await documentService.deleteDocument(id);
                toast.success("Document and its associated study materials have been deleted successfully.");
                fetchDashboard();
            } catch (error) {
                toast.error(error.error || error.message || "Failed to delete the document. Please try again.");
            }
        }
    };

    const handleDeleteQuiz = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this quiz result?")) {
            try {
                await quizService.deleteQuiz(id);
                toast.success("Quiz history has been successfully removed.");
                fetchDashboard();
            } catch (error) {
                toast.error(error.error || error.message || "Failed to delete quiz history. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const overview = data?.overview || {
        totalDocuments: 0,
        totalFlashcards: 0,
        completedQuizzes: 0,
        averageScore: 0,
    };

    const recentDocs = data?.recentActivity?.documents || [];
    const recentQuizzes = data?.recentActivity?.quizzes || [];

    return (
        <div className="space-y-8 pb-8">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome back, {user?.username || "Learner"}! 👋
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">
                        Ready to master your subjects today?
                    </p>
                </div>
                <button
                    onClick={handleResetProgress}
                    disabled={resetting}
                    className="flex items-center justify-center gap-2 self-start sm:self-center text-xs font-bold text-white bg-primary hover:opacity-85 rounded-xl px-4 py-2.5 transition-all shadow-sm shadow-primary/20 active:scale-[0.97] duration-200 disabled:opacity-50"
                    title="Reset flashcard progress and quiz scores"
                >
                    {resetting ? (
                        <Loader2 className="animate-spin text-white" size={14} />
                    ) : (
                        <RotateCcw className="text-white" size={14} />
                    )}
                    Reset Learning Stats
                </button>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Documents" 
                    value={overview.totalDocuments} 
                    icon={FileText} 
                    color="bg-blue-500" 
                />
                <StatCard 
                    title="Flashcards Learned" 
                    value={overview.totalFlashcards} 
                    icon={Layers} 
                    color="bg-purple-500" 
                />
                <StatCard 
                    title="Quizzes Taken" 
                    value={overview.completedQuizzes} 
                    icon={HelpCircle} 
                    color="bg-emerald-500" 
                />
                <StatCard 
                    title="Average Score" 
                    value={`${overview.averageScore}%`} 
                    icon={Trophy} 
                    color="bg-orange-500" 
                />
            </div>

            {/* Activity Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Documents */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
                                <Activity size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Documents</h2>
                        </div>
                        <Link to="/documents" className="text-sm font-semibold text-primary hover:text-orange-600 flex items-center gap-1 transition-colors">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentDocs.length > 0 ? recentDocs.map((doc, i) => (
                            <Link key={i} to={`/documents/${doc._id}`} className="group block bg-gray-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded-xl p-4 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            PDF
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{doc.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Uploaded recently</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => handleDeleteDocument(e, doc._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Document"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center py-8 text-gray-400 font-medium">No documents uploaded yet.</div>
                        )}
                    </div>
                </div>

                {/* Recent Quizzes */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500">
                                <HelpCircle size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Quizzes</h2>
                        </div>
                        <Link to="/quizzes" className="text-sm font-semibold text-primary hover:text-orange-600 flex items-center gap-1 transition-colors">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentQuizzes.length > 0 ? recentQuizzes.map((quiz, i) => (
                            <Link key={i} to={quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`} className="group block bg-gray-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded-xl p-4 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center pl-0.5">
                                            <Play size={16} className="fill-current" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{quiz.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                                Score: <span className={quiz.score >= 70 ? "text-emerald-500" : "text-orange-500"}>{quiz.score}%</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDeleteQuiz(e, quiz._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Quiz"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center py-8 text-gray-400 font-medium">No quizzes taken yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-default">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-semibold text-gray-500 tracking-wide mb-1">{title}</p>
                <p className="text-3xl font-black text-gray-900">{value}</p>
            </div>
            <div className={`${color} p-3 rounded-xl text-white shadow-sm transform group-hover:-translate-y-1 transition-transform`}>
                <Icon size={22} />
            </div>
        </div>
    </div>
);

export default DashboardPage;