import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendOTP, verifyOTP } from './controllers/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/auth/send-otp', sendOTP);
app.post('/api/auth/verify-otp', verifyOTP);

// Export for Vercel Serverless
export default app;
