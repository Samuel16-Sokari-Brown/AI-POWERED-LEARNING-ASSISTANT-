import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import flashcardService from "../../services/flashcardService";
import { ArrowLeft, Loader2, RefreshCcw, ChevronLeft, ChevronRight, Star, Brain } from "lucide-react";
import toast from "react-hot-toast";

const FlashcardPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [flashcardSet, setFlashcardSet] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const loadCards = async () => {
            try {
                const data = await flashcardService.getFlashcardsForDocument(id);
                if (data && data.length > 0) {
                    setFlashcardSet(data[0]); // assume first set for this doc
                }
            } catch (error) {
                toast.error("Failed to load the study session. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        loadCards();
    }, [id]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        if (!flashcardSet) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev < flashcardSet.cards.length - 1 ? prev + 1 : prev));
        }, 150);
    };

    const handlePrev = () => {
        if (!flashcardSet) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }, 150);
    };

    const handleStar = async (e) => {
        e.stopPropagation();
        try {
            const currentCard = flashcardSet.cards[currentIndex];
            await flashcardService.toggleStar(currentCard._id);
            
            // Optimistic UI update
            const newSet = { ...flashcardSet };
            newSet.cards[currentIndex].isStarred = !newSet.cards[currentIndex].isStarred;
            setFlashcardSet(newSet);
        } catch (error) {
            toast.error("Unable to update star status. Please check your internet connection.");
        }
    };

    if (loading) return (
         <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
    );

    if (!flashcardSet || !flashcardSet.cards?.length) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No flashcards available</h2>
            <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go back</button>
        </div>
    );

    const card = flashcardSet.cards[currentIndex];
    const progress = ((currentIndex + 1) / flashcardSet.cards.length) * 100;

    return (
        <div className="h-full flex flex-col items-center max-w-4xl mx-auto space-y-6">
            <div className="w-full flex items-center justify-between mb-4">
                <button onClick={() => navigate('/flashcards')} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-bold text-gray-900">{flashcardSet.documentId?.title || "Study Session"}</h1>
                    <p className="text-sm text-gray-500 font-medium">Card {currentIndex + 1} of {flashcardSet.cards.length}</p>
                </div>
                <div className="w-10"></div> {/* Spacer to center title */}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Flashcard Area */}
            <div className="relative w-full aspect-[4/3] max-h-[400px] sm:max-h-[500px] perspective-[1000px] cursor-pointer" onClick={handleFlip}>
                <div 
                    className="w-full h-full relative transition-transform duration-500"
                    style={{ 
                        transformStyle: 'preserve-3d', 
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                    }}
                >
                    {/* Front side (Question) */}
                    <div 
                        className="absolute inset-0 w-full h-full bg-white border-2 border-gray-100 rounded-3xl shadow-lg p-8 sm:p-12 flex items-center justify-center text-center !backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <button 
                            onClick={handleStar}
                            className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${card.isStarred ? 'text-amber-400 bg-amber-50' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            <Star className={card.isStarred ? 'fill-current' : ''} size={24} />
                        </button>
                        
                        <div className="absolute top-6 left-6 flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-bold">
                            <Brain size={16} /> Question
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
                            {card.question}
                        </h2>
                        
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 flex items-center gap-2 text-sm font-medium animate-pulse">
                            <RefreshCcw size={16} /> Click to reveal answer
                        </div>
                    </div>

                    {/* Back side (Answer) */}
                    <div 
                        className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-orange-400 border-none rounded-3xl shadow-lg p-8 sm:p-12 flex items-center justify-center text-center !backface-hidden text-white"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="absolute top-6 left-6 text-white/80 bg-white/20 px-3 py-1.5 rounded-lg text-sm font-bold">
                            Answer
                        </div>

                        <p className="text-xl sm:text-2xl font-medium leading-relaxed drop-shadow-sm">
                            {card.answer}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 pt-4">
                <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className="p-4 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest px-4">
                    Controls
                </div>
                <button 
                    onClick={handleNext} 
                    disabled={currentIndex === flashcardSet.cards.length - 1}
                    className="p-4 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default FlashcardPage;