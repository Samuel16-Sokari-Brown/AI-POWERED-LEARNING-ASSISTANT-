import Document from '../models/Document.js'
import Flashcard from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js'
import { extractTextFromPDF } from '../utils/pdfParser.js'
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { chunkText } from '../utils/textChunker.js';

//@desc Upload pdf document
//@route POST /api/documents/upload
//@access private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file){
            return res.status(400).json({
                success: false,
                error: 'please uplaod a pdf file',
                statusCode: 400
            })
        }

        const { title } = req.body;
        if (!title ){
            //Delete uploaded file if not title provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400,
            })
        }
        //Construct the URL for uploaded file
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`

        // Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            filename: req.file.originalname,
            filepath: fileUrl, // Store the Url instead of the local path
            fileSize: req.file.size,
            status: 'processing'
        });
        //Process Pdf in background (in production use a queue like bull)
        processPDF(document._id, req.file.path).catch(err => {
            console.error('PDF processing error:', err);
        });
        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully, processing in progress...'
        });
    }
    catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// Helper function to process pdf
const processPDF = async (documentId, filepath) => {
    try{
        const { text } = await extractTextFromPDF(filepath)
        
        // create chunks
        const rawChunks = chunkText(text, 500, 50);

        const chunks = rawChunks.map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber || 0
        }));

        // Update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });
        console.log(`Document ${documentId} processed successfully`)
    } catch (error) {
        console.error(`Error processing document ${documentId}`, error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
}

//@desc Get all user document
//@route GET /api/documents/upload
//@access private
export const getDocuments = async (req, res, next) => {
    try{
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id)}
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets'},
                    quizCount: { $size: '$quizzes'}
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort:{
                    createdAt: -1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    }
    catch (error){
        next(error);
    }
};

//@desc Get single document with chunks
//@route GET /api/documents/upload
//@access private

export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!document) {
        return res.status(404).json({
            success: false,
            error: 'Document not found',
            statusCode: 404
        });
    }

    // Get counts of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({ 
        documentId: document._id, 
        userId: req.user._id 
    });

    const quizCount = await Quiz.countDocuments({ 
        documentId: document._id, 
        userId: req.user._id 
    });

    // update last accessed
    document.lastAccessed = Date.now();
await document.save();

// Combine document data with counts
const documentData = document.toObject();
documentData.flashcardCount = flashcardCount;
documentData.quizCount = quizCount;

res.status(200).json({
  success: true,
  data: documentData
});
} catch (error) {
    next(error);
}
};

//@desc Delete document
//@route DELETE /api/documents/upload
//@access private
export const  deleteDocument = async (req, res, next) => {
     try{
        const document = await Document.findOne({
        _id: req.params.id,
        userId: req.user._id
        });

    if (!document) {
    return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404
    });
}
    // Delete file from filesystem
    const filename = document.filepath.split('/').pop();
    const localPath = path.join('uploads', 'documents', filename);
    await fs.unlink(localPath).catch(() => {});

    // Delete document
    await document.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
    })
    }
    catch (error){
        next(error);
    }
};

