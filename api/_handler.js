import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/api.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-pin', 'X-Admin-Pin', 'adminpin', 'adminPin', 'x-admin-email', 'x-requested-with', 'Accept']
}));
app.use(express.json());

// Normalize incoming path for Express routing
app.use((req, res, next) => {
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || '';
  if (matchedPath && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  } else if (Array.isArray(req.query?.path)) {
    req.url = '/api/' + req.query.path.join('/');
  } else if (typeof req.query?.path === 'string') {
    req.url = '/api/' + req.query.path;
  } else if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/auth')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
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
