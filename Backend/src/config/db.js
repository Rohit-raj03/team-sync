import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.warn('⚠️  MONGO_URI not specified in environment. Running in mock/standalone mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't kill process immediately in dev so app can still boot
  }
};
