import express from 'express';
import http from 'http';
import fs from 'fs';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { setupSocketHandler } from './sockets/socketHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandler(io);

// Attach io to requests for real-time broadcasts
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api', apiRouter);

// Serve static frontend files built by Vite
const publicDir = fs.existsSync(path.join(__dirname, 'public/index.html'))
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '../client/dist');
app.use(express.static(publicDir));

// SPA catch-all fallback
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <head><title>Chess Arena Server</title></head>
          <body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;padding:40px;text-align:center;">
            <h1>♟️ Chess Arena Server Running</h1>
            <p>API and WebSocket server active on port ${PORT}.</p>
            <p>Vite frontend building...</p>
          </body>
        </html>
      `);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`♟️ CHESS ARENA SERVER STARTED`);
  console.log(`🚀 Live on: http://localhost:${PORT}`);
  console.log(`📡 WebSocket & WebRTC Signaling Ready`);
  console.log(`===============================================`);
});
