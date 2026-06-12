import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import sseRoutes from './routes/sseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json({ limit: "5mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "NotifyHub API is running" }); 
});

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', notificationRoutes);
app.use('/api/sse', sseRoutes); // Server-Sent Events — persistent push channel per user

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
