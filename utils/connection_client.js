import mongoose from "mongoose";
import dotEnv from "dotenv";
dotEnv.config();

export const connectMongoose = async () => {
  try {
    return mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    throw error;
  }
};
