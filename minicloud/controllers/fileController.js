import File from "../models/File.js";
import fs from "fs";
import path from "path";

// Uploading files
export const uploadFile = async (req, res) => {
    try {
        const { originalname, path: filePath, mimetype, size } = req.file;

        const newfile = new File({
            userId: req.user.id,
            fileName: originalname,
            filePath,
            fileType: mimetype,
            size,
        });

        await newfile.save();
        res.status(201).json({ message: "File uploaded successfully", file: newfile });
    } catch (error) {
        res.status(500).json({ message: "Error uploading file", error: error.message });
    }
};

// Listing files
export const listFiles = async (req, res) => {
    try {
        const files = await File.find({ userId: req.user.id });
        res.json({ files });
    } catch (error) {
        res.status(500).json({ message: "Error listing files", error: error.message });
    }
};

// Downloading files
export const downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        // check if file exists and belongs to user
        if (!file || file.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: "File not found" });
        }
        res.download(file.filePath, file.fileName);
    } catch (error) {
        res.status(500).json({ message: "Error downloading file", error: error.message });
    }
};

// Deleting files
export const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        // check if file exists and belongs to user
        if (!file || file.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: "File not found" });
        }
        // delete from storage
        try {
            fs.unlinkSync(file.filePath);
        } catch (fsErr) {
            // log, but continue to delete DB record
            console.warn("Could not delete file from storage:", fsErr.message);
        }
        await file.deleteOne(); // delete from DB
        res.json({ message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting file", error: error.message });
    }
};

// Get storage info for the logged-in user
export const getStorageInfo = async (req, res) => {
  try {
        // Use userId because File documents store userId (not ownerEmail)
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const files = await File.find({ userId });

    const usedBytes = files.reduce((sum, f) => sum + f.size, 0);
    const totalBytes = 100 * 1024 * 1024; // 100 MB (default quota)

    res.json({
      used: usedBytes,
      total: totalBytes,
      remaining: totalBytes - usedBytes
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get storage info" });
  }
};

