import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import { ArrowLeft, Loader2, CheckCircle2, Circle } from "lucide-react";
import toast from "react-hot-toast";

const QuizTakePage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await quizService.getQuizById(quizId);
                if (data) {
                    if (data.completedAt) {
                        toast.success("This quiz has already been completed. Showing your results.");
                        navigate(`/quizzes/${data._id}/results`, { replace: true });
                        return;
                    }
                    setQuiz(data);
                    // Initialize answers array
                    setAnswers(data.questions.map((q, i) => ({ questionIndex: i, selectedAnswer: null })));
                } else {
                    toast.error("Oops! We couldn't find the requested quiz.");
                    navigate('/dashboard');
                }
            } catch (error) {
                toast.error("Failed to load the quiz. Please check your connection and try again.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId, navigate]);

    const handleSelectOption = (questionIndex, option) => {
        setAnswers(prev => prev.map((ans) => 
            ans.questionIndex === questionIndex ? { ...ans, selectedAnswer: option } : ans
        ));
    };

    const handleSubmit = async () => {
        // Check if all answered
        const unanswered = answers.filter(a => !a.selectedAnswer).length;
        if (unanswered > 0) {
            if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
                return;
            }
        }

        setSubmitting(true);
        try {
            await quizService.submitQuiz(quizId, answers);
            toast.success("Awesome! Your quiz has been submitted successfully.");
            navigate(`/quizzes/${quizId}/results`, { replace: true });
        } catch (error) {
            toast.error(error.error || error.message || "We couldn't submit your answers. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!quiz) return null;

    const answeredCount = answers.filter(a => a.selectedAnswer).length;
    const progress = (answeredCount / quiz.questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between sticky top-[5rem] z-10 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
                        <p className="text-sm text-gray-500 font-medium">{quiz.questions.length} Questions</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 hidden sm:flex">
                    <div className="text-right mr-2">
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{answeredCount} of {quiz.questions.length} Answered</p>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-primary hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2"
                    >
                        {submitting && <Loader2 size={16} className="animate-spin" />} Submit Quiz
                    </button>
                </div>
            </div>

            {/* Mobile Progress & submit */}
            <div className="sm:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-bold text-emerald-500">{Math.round(progress)}% Completed</p>
                <button 
                    onClick={handleSubmit} disabled={submitting}
                    className="text-xs bg-primary text-white px-4 py-2 rounded-lg font-bold"
                >Submit</button>
            </div>

            {/* Progress line */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
                {quiz.questions.map((q, index) => {
                    const currentAnswer = answers.find(a => a.questionIndex === index)?.selectedAnswer;
                    return (
                        <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 transition-all hover:border-gray-200">
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="w-full">
                                    <h3 className="text-lg font-bold text-gray-900 leading-snug mb-6">{q.question}</h3>
                                    
                                    <div className="space-y-3">
                                        {q.options.map((option, optIdx) => {
                                            const isSelected = currentAnswer === option;
                                            return (
                                                <button 
                                                    key={optIdx} 
                                                    onClick={() => handleSelectOption(index, option)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                                                        isSelected 
                                                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {isSelected ? (
                                                        <CheckCircle2 className="text-primary shrink-0 transition-transform scale-110" size={20} />
                                                    ) : (
                                                        <Circle className="text-gray-300 shrink-0 transition-colors" size={20} />
                                                    )}
                                                    <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{option}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-100 gap-4">
                <p className="text-sm font-bold text-gray-500">
                    You've answered <span className="text-emerald-500">{answeredCount}</span> of {quiz.questions.length} questions
                </p>
                <button 
                    onClick={handleSubmit} disabled={submitting}
                    className="w-full sm:w-auto bg-primary hover:bg-orange-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-all focus:ring-4 focus:ring-primary/20 flex items-center justify-center gap-2"
                >
                    {submitting && <Loader2 size={18} className="animate-spin" />} Submit Quiz
                </button>
            </div>
        </div>
    );
};

export default QuizTakePage;