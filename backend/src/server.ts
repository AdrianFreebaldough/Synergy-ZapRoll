import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registrationRoutes from './routes/registrationRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/register', registrationRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/events', eventRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Synergy Backend running on http://localhost:${PORT}`);
});
