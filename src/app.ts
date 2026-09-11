import express from 'express';
import cors from 'cors';
import triageRoutes from './routes/triage.routes';
import aiRoutes from './routes/ai.routes';
import patRoutes from './routes/pat.routes';

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cors());

app.use('/api/triage', triageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pat', patRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Prapokklao Smart Pre-Triage API Server is running'
  });
});

export default app;
