import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Trophy, BarChart3, AlertCircle, Circle } from "lucide-react";
import toast from "react-hot-toast";

const QuizResultPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await quizService.getQuizResults(quizId);
                if (data) {
                    setResult(data);
                } else {
                    toast.error("Quiz results could not be located.");
                    navigate('/dashboard');
                }
            } catch (error) {
                toast.error(error.error || error.message || "Failed to load quiz results. Please try again.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [quizId, navigate]);

    if (loading) return (
         <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
    );

    if (!result) return null;

    const { quiz, results } = result;
    const isPass = quiz.score >= 70;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fade-in">
            <button onClick={() => navigate('/documents')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors">
                <ArrowLeft size={16} /> Back to Documents
            </button>

            {/* Score Card */}
            <div className={`rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden ${isPass ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                {/* Decorative background elements */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-sm backdrop-blur-sm">
                        <Trophy size={32} className="text-white" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold opacity-90 mb-2">Quiz Completed!</h1>
                    <div className="text-6xl sm:text-8xl font-black mb-4 drop-shadow-md tracking-tighter">
                        {quiz.score}<span className="text-3xl sm:text-5xl opacity-80">%</span>
                    </div>
                    <p className="text-base sm:text-lg font-medium opacity-90 mb-6 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
                        {isPass ? "Great job! Keep up the good work." : "Needs review. Try generating flashcards!"}
                    </p>
                    
                    <div className="flex bg-black/10 rounded-xl divide-x divide-white/20 shadow-sm border border-white/10 backdrop-blur-sm">
                        <div className="px-6 py-3">
                            <p className="text-xs uppercase tracking-wider opacity-70 font-semibold mb-1">Total</p>
                            <p className="text-xl font-bold">{quiz.totalQuestions}</p>
                        </div>
                        <div className="px-6 py-3">
                            <p className="text-xs uppercase tracking-wider opacity-70 font-semibold mb-1">Correct</p>
                            <p className="text-xl font-bold">{results.filter(r => r.isCorrect).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-lg font-bold text-gray-900 px-1 mt-8">
                <BarChart3 size={20} className="text-primary" />
                <h2>Detailed Feedback</h2>
            </div>

            {/* Questions Review List */}
            <div className="space-y-6">
                {results.map((r, i) => (
                    <div key={i} className={`bg-white rounded-2xl p-6 sm:p-8 shadow-sm border ${r.isCorrect ? 'border-emerald-100' : 'border-red-100'} transition-all`}>
                        <div className="flex gap-4">
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${r.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {i + 1}
                            </div>
                            <div className="w-full space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">{r.question}</h3>
                                
                                <div className="space-y-2.5">
                                    {r.options.map((opt, optIdx) => {
                                        let actualCorrect = r.correctAnswer;
                                        const matchMatch = actualCorrect?.match(/^(?:O|Option\s*)(\d)$/i);
                                        if (matchMatch) {
                                            actualCorrect = r.options[parseInt(matchMatch[1]) - 1] || actualCorrect;
                                        }

                                        const isSelected = r.selectedAnswer === opt;
                                        const isActuallyCorrect = actualCorrect === opt;
                                        
                                        let borderClass = "border-gray-100 bg-gray-50/50 text-gray-600";
                                        let Icon = Circle;
                                        
                                        if (isActuallyCorrect) {
                                            borderClass = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/20 font-medium";
                                            Icon = CheckCircle2;
                                        } else if (isSelected && !isActuallyCorrect) {
                                            borderClass = "border-red-400 bg-red-50 text-red-800 font-medium";
                                            Icon = XCircle;
                                        }

                                        return (
                                            <div key={optIdx} className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${borderClass}`}>
                                                <Icon className={`shrink-0 mt-0.5 ${isActuallyCorrect ? 'text-emerald-500' : (isSelected ? 'text-red-500' : 'text-gray-300')}`} size={18} />
                                                <span className="leading-snug">{opt}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {!r.isCorrect && r.explanation && (
                                    <div className="mt-6 bg-amber-50 rounded-xl p-4 flex gap-3 border border-amber-100">
                                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800 mb-1">Explanation</p>
                                            <p className="text-sm text-amber-900/80 leading-relaxed">{r.explanation}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizResultPage;