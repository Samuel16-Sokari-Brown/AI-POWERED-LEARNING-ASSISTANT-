import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import progressService from "../../services/progressService";
import quizService from "../../services/quizService";
import { HelpCircle, ArrowRight, BookOpen, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const QuizListPage = () => {
    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const response = await progressService.getDashboardData();
            if (response.success && response.data?.recentActivity?.quizzes) {
                setRecentQuizzes(response.data.recentActivity.quizzes);
            }
        } catch (error) {
            toast.error("Unable to load your quizzes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleDeleteQuiz = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this quiz result?")) {
            try {
                await quizService.deleteQuiz(id);
                toast.success("Quiz record removed successfully.");
                fetchDashboard();
            } catch (error) {
                toast.error(error.error || error.message || "Failed to remove quiz history. Please try again.");
            }
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Quizzes</h1>
                <p className="text-gray-500 text-sm">Review your recently taken quizzes. To take a new quiz, head to your Documents and generate one.</p>
            </div>

            {recentQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentQuizzes.map((quiz, i) => (
                        <Link key={i} to={quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col h-full cursor-pointer relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                    <HelpCircle size={24} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xl font-bold ${quiz.score >= 70 ? 'text-emerald-500' : 'text-orange-500'}`}>{quiz.score}%</span>
                                    <button 
                                        onClick={(e) => handleDeleteQuiz(e, quiz._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Quiz"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-1">{quiz.title}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-6">{quiz.totalQuestions} Questions</p>
                            
                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                    {quiz.completedAt ? "View Detailed Results" : "Take Quiz"} <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No quizzes taken yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">Generate your first quiz from an uploaded document to start testing your knowledge.</p>
                    <Link to="/documents" className="text-primary font-medium hover:underline flex items-center gap-2">
                        Go to Documents <ArrowRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default QuizListPage;
