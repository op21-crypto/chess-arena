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

// Normalize incoming path for Express routing
app.use((req, res, next) => {
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || '';
  if (matchedPath && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  } else if (req.url === '/api/index.js' && matchedPath) {
    req.url = matchedPath;
  }
  next();
});

// Mount routes: support /api/..., /auth/..., or direct mounts
app.use('/api', apiRouter);
app.use('/auth', (req, res, next) => {
  req.url = '/auth' + req.url;
  apiRouter(req, res, next);
});
app.use('/', apiRouter);

export default function handler(req, res) {
  return app(req, res);
}
