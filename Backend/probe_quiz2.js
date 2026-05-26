import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Quiz from './models/Quiz.js';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
    await connectDB();
    const quiz = await Quiz.findOne({ completedAt: { $ne: null } });
    if (!quiz) {
        console.log("No completed quiz found.");
    } else {
        console.log("Quiz ID:", quiz._id);
        console.log("Score:", quiz.score);
        console.log("Questions size:", quiz.questions.length);
        console.log("First question option 1:", JSON.stringify(quiz.questions[0].options[0]));
        console.log("First question correctAnswer:", JSON.stringify(quiz.questions[0].correctAnswer));
        console.log("First question selectedAnswer:", JSON.stringify(quiz.userAnswers[0]?.selectedAnswer));
        console.log("First question isCorrect:", quiz.userAnswers[0]?.isCorrect);
        console.log("First question explanation:", quiz.questions[0].explanation);
    }
    process.exit(0);
}
runTest();
