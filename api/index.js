import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/api.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Support both /api mounts and root mounts for flexible Vercel rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
