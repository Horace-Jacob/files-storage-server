import mongoose from "mongoose";

const FileModel = new mongoose.Schema({
  filename: {
    required: true,
    type: String,
  },
  fileSize: {
    required: true,
    type: String,
  },
  displayName: {
    required: true,
    type: String,
  },
  userId: {
    required: true,
    type: String,
  },
  fileId: {
    required: true,
    type: String,
  },
  createdAt: {
    default: Date.now(),
    type: Date,
  },
});

const FileSchema = mongoose.model("Files", FileModel);
export default FileSchema;
