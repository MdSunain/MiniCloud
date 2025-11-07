import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import { getStorageInfo } from "../controllers/fileController.js";
import { uploadFile, listFiles, downloadFile, deleteFile } from "../controllers/fileController.js";


// Setup Multer for storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
const router = express.Router();

// Routes
router.post("/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/list", authMiddleware, listFiles);
router.get("/download/:id", authMiddleware, downloadFile);
router.delete("/delete/:id", authMiddleware, deleteFile);
router.get("/storage", authMiddleware, getStorageInfo);

export default router;
