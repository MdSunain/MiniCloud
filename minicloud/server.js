import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import instanceRoutes from './routes/instanceRoutes.js';

// Load environment variables first
dotenv.config();

// Connect to database
connectDb();

const app = express();
app.use(express.json());
app.use(cors());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use("/api/instances", instanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});