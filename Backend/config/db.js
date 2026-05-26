import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // 🌟 Changed to MONGO_URI to match your .env file, and added dbName
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'AIPOWEREDLEARNINGWEBAPP'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
