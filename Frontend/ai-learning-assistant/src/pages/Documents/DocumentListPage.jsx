import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, Plus, Search, Trash2, Loader2, UploadCloud, ArrowRight } from "lucide-react";
import documentService from "../../services/documentService";
import toast from "react-hot-toast";
import moment from "moment";

const DocumentListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearch = searchParams.get("q") || "";
    
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    
    useEffect(() => {
        const query = searchParams.get("q");
        if (query !== null) {
            setSearchTerm(query);
        }
    }, [searchParams]);
    
    const [uploading, setUploading] = useState(false);
    
    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const data = await documentService.getDocuments();
            setDocuments(data || []);
        } catch (error) {
            toast.error("Unable to load your documents. Please refresh the page or check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if(!confirm("Are you sure you want to delete this document?")) return;
        
        try {
            await documentService.deleteDocument(id);
            setDocuments(docs => docs.filter(d => d._id !== id));
            toast.success("Document has been successfully deleted.");
        } catch (error) {
            toast.error(error.error || error.message || "Unable to delete the document. Please try again.");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return toast.error("Please enter a document title and select a PDF file to upload.");
        
        setUploading(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("file", file);

        try {
            await documentService.uploadDocument(formData);
            toast.success("Your document was uploaded successfully! We are now analyzing it.");
            setShowUploadModal(false);
            setFile(null);
            setTitle("");
            fetchDocuments();
        } catch (error) {
            toast.error(error.error || error.message || "Failed to upload the document. Please verify the file is a valid PDF and try again.");
        } finally {
            setUploading(false);
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and interact with your study materials</p>
                </div>
                <button 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary/20"
                >
                    <Plus size={20} />
                    Upload PDF
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search documents by title..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (e.target.value) {
                                setSearchParams({ q: e.target.value });
                            } else {
                                setSearchParams({});
                            }
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <Link key={doc._id} to={`/documents/${doc._id}`} className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col h-full cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <button onClick={(e) => handleDelete(doc._id, e)} className="p-2 bg-white/50 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <FileText size={24} />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-1 line-clamp-1">{doc.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-1 flex-1">{doc.filename}</p>
                            
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium">
                                <span className={`px-2 py-1 rounded-md ${
                                    doc.status === 'ready' ? 'bg-emerald-50 text-emerald-600' :
                                    doc.status === 'processing' ? 'bg-orange-50 text-orange-600' :
                                    'bg-gray-50 text-gray-600'
                                }`}>
                                    {(doc.status || 'unknown').charAt(0).toUpperCase() + (doc.status || 'unknown').slice(1)}
                                </span>
                                <span className="text-gray-400">{moment(doc.createdAt).fromNow()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No documents found</h3>
                    <p className="text-gray-500 max-w-sm mb-6">You haven't uploaded any documents yet, or none match your search criteria.</p>
                    <button onClick={() => setShowUploadModal(true)} className="text-primary font-medium hover:underline flex items-center gap-2">
                        Upload your first PDF <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Document</h2>
                        <p className="text-sm text-gray-500 mb-6">Upload a PDF to generate AI study materials.</p>
                        
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="e.g. Biology Post-Midterm Notes"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                        file ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <UploadCloud className={`mx-auto mb-2 ${file ? 'text-primary' : 'text-gray-400'}`} size={32} />
                                    {file ? (
                                        <p className="text-sm font-medium text-primary">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-900">Click to select a file</p>
                                            <p className="text-xs text-gray-500">PDF documents up to 10MB</p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="application/pdf"
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={(e) => setFile(e.target.files?.[0])}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={uploading || !file || !title}
                                    className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentListPage;