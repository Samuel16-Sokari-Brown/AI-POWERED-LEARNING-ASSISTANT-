import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import documentService from "../../services/documentService";
import aiService from "../../services/aiService";
import { ArrowLeft, Loader2, Sparkles, AlertCircle, Bot, Zap, Brain, Send, Lightbulb, Search, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const DocumentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // overview, explain, chat
    
    // AI Generation states
    const [generating, setGenerating] = useState(false);
    const [aiSummary, setAiSummary] = useState(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [numFlashcards, setNumFlashcards] = useState(10);
    const [startPage, setStartPage] = useState("");
    const [endPage, setEndPage] = useState("");

    // Explain states
    const [conceptInput, setConceptInput] = useState("");
    const [conceptExplanation, setConceptExplanation] = useState(null);
    const [explaining, setExplaining] = useState(false);

    // Chat states
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchDocumentDetails();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'chat' && chatHistory.length === 0) {
            fetchChatHistory();
        }
    }, [activeTab]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, chatLoading]);

    const fetchDocumentDetails = async () => {
        setLoading(true);
        try {
            const res = await documentService.getDocumentById(id);
            setDocument(res.data || res);
        } catch (error) {
            toast.error("We had trouble loading this document. Redirecting you back to your library...");
            navigate("/documents");
        } finally {
            setLoading(false);
        }
    };

    const fetchChatHistory = async () => {
        try {
            const data = await aiService.getChatHistory(id);
            if (data) setChatHistory(data);
        } catch (error) {
            console.error("Failed to load chat", error);
        }
    };

    const handleGenerateSummary = async () => {
        setGenerating('summary');
        try {
            const content = await aiService.generateSummary(id);
            setAiSummary(content.summary);
            toast.success("Study summary generated successfully!");
        } catch (error) {
            toast.error(error.error || error.message || "Unable to generate a document summary. Please try again in a few moments.");
        } finally {
            setGenerating(false);
        }
    };

    const handleExplainConcept = async (e) => {
        e.preventDefault();
        if (!conceptInput.trim()) return;
        setExplaining(true);
        try {
            const res = await aiService.explainConcept(id, conceptInput);
            setConceptExplanation(res.explanation);
        } catch (error) {
            toast.error(error.error || error.message || "We couldn't explain this concept. Please try another term.");
        } finally {
            setExplaining(false);
        }
    }

    const handleGenerateFlashcards = async () => {
        setGenerating('flashcards');
        try {
            const options = { count: numFlashcards };
            if (startPage) options.startPage = startPage;
            if (endPage) options.endPage = endPage;
            
            await aiService.generateFlashcards(id, options);
            toast.success("Flashcards generated successfully! Let's start studying.");
            navigate("/flashcards");
        } catch (error) {
            toast.error(error.error || error.message || "Failed to generate flashcards. Try selecting a smaller page range or check your connection.");
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateQuiz = async () => {
        setGenerating('quiz');
        try {
            const options = { numQuestions };
            if (startPage) options.startPage = startPage;
            if (endPage) options.endPage = endPage;

            const quiz = await aiService.generateQuiz(id, options);
            toast.success("Quiz generated successfully! Redirecting you now...");
            if (quiz?._id) navigate(`/quizzes/${quiz._id}`);
            else navigate("/quizzes");
        } catch (error) {
            toast.error(error.error || error.message || "We couldn't generate a quiz for this document. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading) return;
        
        const msg = chatInput;
        setChatInput("");
        setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
        setChatLoading(true);

        try {
            const data = await aiService.chat(id, msg);
            setChatHistory(prev => [...prev, { role: 'assistant', content: data?.answer || data }]);
        } catch (error) {
            toast.error(error.error || error.message || "Failed to communicate with the study assistant. Please check your connection and resend your question.");
            setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that request at the moment." }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!document) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
            <div className="flex items-center gap-3 text-sm text-gray-500 hover:text-gray-900 cursor-pointer w-fit" onClick={() => navigate('/documents')}>
                <ArrowLeft size={18} /> Back to Documents
            </div>

            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{document.title}</h1>
                <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                        document.status === 'ready' ? 'bg-emerald-50 text-emerald-600' :
                        document.status === 'processing' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'
                    }`}>
                        {document.status || "UNKNOWN"}
                    </span>
                    <span className="text-gray-500 font-medium">Size: {(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
            </div>

            <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar pt-2">
                <button onClick={() => setActiveTab('content')} className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'content' || activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Content</button>
                <button onClick={() => setActiveTab('chat')} className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Chat</button>
                <button onClick={() => setActiveTab('actions')} className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === 'actions' || activeTab === 'explain' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>AI Actions</button>
                <button onClick={() => navigate('/flashcards')} className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-700`}>Flashcards</button>
                <button onClick={() => navigate('/quizzes')} className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-700`}>Quizzes</button>
            </div>

            <div className="mt-6">
                {(activeTab === 'content' || activeTab === 'overview') && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[85vh] min-h-[800px] bg-white shadow-sm">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-gray-700">Document Viewer</h3>
                            <a href={document.filepath} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline text-sm flex items-center gap-1.5 font-bold transition-colors">
                                <ExternalLink size={16} /> Open in new tab
                            </a>
                        </div>
                        <iframe 
                            src={document.filepath} 
                            className="w-full flex-1 border-none"
                            title={document.title}
                        />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[85vh] min-h-[800px] bg-[#f8f9fc] shadow-sm relative">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-3">
                                <hr className="w-12 border-gray-200" />
                                Chat context initialized
                                <hr className="w-12 border-gray-200" />
                            </div>
                            
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-br-sm' 
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm leading-relaxed whitespace-pre-wrap'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: "0.15s"}}></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: "0.3s"}}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef}></div>
                        </div>

                        <div className="bg-white p-4 border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="relative group max-w-4xl mx-auto">
                                <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    placeholder="Ask anything about this document..."
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-5 text-sm py-3.5 rounded-full pr-12 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                                <button 
                                    type="submit"
                                    disabled={!chatInput.trim() || chatLoading || document.status !== 'ready'}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white p-2.5 rounded-full transition-colors"
                                >
                                    <Send size={16} className="translate-x-[1px] translate-y-[-1px]" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {(activeTab === 'actions' || activeTab === 'explain') && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Generators Sector */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="text-primary" /> Content Generators
                                </h3>
                                
                                {document.status === "ready" ? (
                                    <div className="space-y-5">
                                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-3">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                Target Pages (Optional)
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="number" min="1" placeholder="Start" value={startPage} onChange={e => setStartPage(e.target.value)} disabled={generating} className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                                <span className="text-slate-400 font-bold">-</span>
                                                <input type="number" min="1" placeholder="End" value={endPage} onChange={e => setEndPage(e.target.value)} disabled={generating} className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 font-bold text-blue-700">
                                                        <Zap size={18} /> Flashcards
                                                    </div>
                                                    <select 
                                                        value={numFlashcards}
                                                        onChange={(e) => setNumFlashcards(Number(e.target.value))}
                                                        disabled={generating}
                                                        className="bg-white text-blue-800 text-xs font-bold px-2 py-1 rounded-md border border-blue-200 outline-none shadow-sm cursor-pointer"
                                                    >
                                                        <option value={5}>5 Cards</option>
                                                        <option value={10}>10 Cards</option>
                                                        <option value={20}>20 Cards</option>
                                                    </select>
                                                </div>
                                                <button onClick={handleGenerateFlashcards} disabled={generating} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2">
                                                    {generating === 'flashcards' ? <Loader2 className="animate-spin" size={16} /> : "Generate"}
                                                </button>
                                            </div>

                                            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 font-bold text-emerald-700">
                                                        <Brain size={18} /> Quiz
                                                    </div>
                                                    <select 
                                                        value={numQuestions}
                                                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                                                        disabled={generating}
                                                        className="bg-white text-emerald-800 text-xs font-bold px-2 py-1 rounded-md border border-emerald-200 outline-none shadow-sm cursor-pointer"
                                                    >
                                                        <option value={5}>5 Qs</option>
                                                        <option value={10}>10 Qs</option>
                                                        <option value={15}>15 Qs</option>
                                                    </select>
                                                </div>
                                                <button onClick={handleGenerateQuiz} disabled={generating} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2">
                                                    {generating === 'quiz' ? <Loader2 className="animate-spin" size={16} /> : "Generate"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : document.status === "processing" ? (
                                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 text-orange-700">
                                        <Loader2 className="animate-spin shrink-0" size={20} />
                                        <p className="text-sm font-medium">Document is processing. AI unavailable.</p>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 text-red-700">
                                        <AlertCircle className="shrink-0" size={20} />
                                        <p className="text-sm font-medium">Document processing failed.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Document Summary</h3>
                                    <button 
                                        onClick={handleGenerateSummary}
                                        disabled={generating || document.status !== "ready"}
                                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <Sparkles size={14} /> Generate
                                    </button>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 min-h-[150px]">
                                    {generating === 'summary' ? (
                                        <div className="h-full flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-primary" size={24} />
                                        </div>
                                    ) : aiSummary ? (
                                        <div className="prose prose-sm max-w-none text-gray-600 line-clamp-none">{aiSummary}</div>
                                    ) : (
                                        <div className="text-center text-gray-400 py-8 text-sm">Click generate to read a smart summary.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Explain Sector */}
                        <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-[600px] lg:h-auto">
                            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <Lightbulb className="text-amber-500" /> Concept Explainer
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">Type a complex term from the document to get a breakdown.</p>

                            <form onSubmit={handleExplainConcept} className="relative mb-6">
                                <input 
                                    type="text"
                                    placeholder="e.g. 'Photosynthesis' or 'React Hooks'"
                                    value={conceptInput}
                                    onChange={e => setConceptInput(e.target.value)}
                                    className="w-full bg-white border border-slate-200 pl-4 py-3 pr-12 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm shadow-sm"
                                />
                                <button 
                                    type="submit"
                                    disabled={explaining || !conceptInput.trim() || document.status !== "ready"}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                                >
                                    <Search size={16} />
                                </button>
                            </form>

                            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 overflow-y-auto">
                                {explaining ? (
                                    <div className="flex flex-col items-center justify-center h-full text-amber-500 gap-3">
                                        <Loader2 className="animate-spin" size={28} />
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Analyzing...</span>
                                    </div>
                                ) : conceptExplanation ? (
                                    <div className="prose prose-sm prose-slate max-w-none">
                                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                                            <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg"><Brain size={18} /></div>
                                            <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs m-0">Explanation</h4>
                                        </div>
                                        <p className="whitespace-pre-wrap leading-relaxed">{conceptExplanation}</p>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-300 py-10">
                                        <Lightbulb size={48} className="opacity-20" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentDetailPage;