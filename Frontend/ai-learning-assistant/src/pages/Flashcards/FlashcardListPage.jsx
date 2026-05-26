import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import flashcardService from "../../services/flashcardService";
import { Layers, Search, Loader2, ArrowRight, BookOpen, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const FlashcardListPage = () => {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSets = async () => {
        try {
            const data = await flashcardService.getAllFlashcardSets();
            setSets(data || []);
        } catch (error) {
            toast.error("Unable to load your flashcard sets. Please try refreshing.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSets();
    }, []);

    const handleDeleteSet = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this flashcard set?")) {
            try {
                await flashcardService.deleteFlashcardSet(id);
                toast.success("Flashcard set has been successfully deleted.");
                fetchSets();
            } catch (error) {
                toast.error(error.error || error.message || "We couldn't delete this flashcard set. Please try again.");
            }
        }
    };

    const filteredSets = sets.filter(s => 
        s.documentId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Flashcards</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and master your study materials</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by document title..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : filteredSets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSets.map((set) => (
                        <Link key={set._id} to={`/documents/${set.documentId?._id}/flashcards`} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col h-full cursor-pointer relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                    <Layers size={24} />
                                </div>
                                <button 
                                    onClick={(e) => handleDeleteSet(e, set._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Flashcard Set"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">{set.documentId?.title || "Unknown Document"}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium">{set.cards.length} Cards</span>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-sm font-semibold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Study Now <ArrowRight size={16} />
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No flashcards found</h3>
                    <p className="text-gray-500 max-w-sm mb-6">Generate flashcards from your uploaded documents to start reviewing.</p>
                    <Link to="/documents" className="text-primary font-medium hover:underline flex items-center gap-2">
                        Go to Documents <ArrowRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FlashcardListPage;