import mongoose from "mongoose";

const fileSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String},
});

const File = mongoose.model("File", fileSchema);
export default File;