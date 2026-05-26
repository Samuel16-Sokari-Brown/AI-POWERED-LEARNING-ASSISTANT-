import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    filename: {
        type: String,
        required: true,
    },
    filepath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    extractedText: {
        type: String,
        default: ''
    },
    chunks: [{
        content: {
            type: String,
            required: true
        },
        chunkIndex: {
            type: Number,
            required: true
        },
        pageNumber: {
            type: Number,
            default: 0
        }
    }],
    status: {
        type: String,
        enum: ['processing', 'ready', 'failed'],
        default: 'processing'
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
// 42 : 39
documentSchema.index({ userId: 1, title: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;