
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
    await connectDB();
    const user = await User.findOne();
    if (!user) {
        console.log("No user found");
        return;
    }
    
    const quizzes = await Quiz.find({ userId: user._id });
    console.log(`Found ${quizzes.length} quizzes`);
    
    for (const quiz of quizzes) {
        if (quiz.completedAt) {
            console.log("Found completed quiz:", quiz._id);
            try {
                const q = await Quiz.findOne({ _id: quiz._id }).populate('documentId', 'title');
                if (!q) console.log("q is null");
                
                const detailedResults = q.questions.map((question, index) => {
                    const userAnswer = q.userAnswers.find(a => a.questionIndex === index);
                    return {
                        questionIndex: index,
                        selected: userAnswer?.selectedAnswer
                    };
                });
                console.log("Detailed results map success for", quiz._id);
                console.log("Returned response data mapping:", {
                    id: q._id,
                    title: q.title,
                    document: q.documentId,
                    score: q.score,
                    totalQuestions: q.totalQuestions,
                    completedAt: q.completedAt
                });
            } catch (err) {
                console.error("Error in mapping for", quiz._id, ":", err);
            }
        } else {
             console.log("Uncompleted quiz:", quiz._id);
        }
    }
    process.exit(0);
}
runTest();
