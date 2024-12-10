import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import adminRoutes from './routes/admin.routes.js';
import connectDB from './db/connect.js';

// Konfigurasi .env
dotenv.config();

// Koneksi ke database
connectDB();

const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [
  'http://localhost:5173',
  'https://nusawarga.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Block by CORS'));
    }
  }, methods: 'GET,POST,PUT,DELETE,OPTIONS',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware parsing JSON body
app.use(express.json());

// Middleware parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ROUTING
app.use(process.env.API_ROUTES, adminRoutes);

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});