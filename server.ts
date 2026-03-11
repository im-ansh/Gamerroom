import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  const PORT = 3000;

  // Store users and messages in memory for this basic example
  const users = new Map<string, { id: string, username: string, color: string }>();
  const messages: { id: string, userId: string, username: string, color: string, text: string, timestamp: number }[] = [];

  // Generate a random color for users
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', 
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', (username: string) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const user = { id: socket.id, username, color };
      users.set(socket.id, user);
      
      // Send current state to the new user
      socket.emit('init', {
        users: Array.from(users.values()),
        messages: messages.slice(-50) // Send last 50 messages
      });

      // Broadcast to others that a user joined
      socket.broadcast.emit('userJoined', user);
      
      // Add a system message
      const systemMsg = {
        id: Math.random().toString(36).substring(2, 9),
        userId: 'system',
        username: 'System',
        color: '#9ca3af',
        text: `${username} joined the server.`,
        timestamp: Date.now()
      };
      messages.push(systemMsg);
      io.emit('message', systemMsg);
    });

    socket.on('sendMessage', (text: string) => {
      const user = users.get(socket.id);
      if (user) {
        const message = {
          id: Math.random().toString(36).substring(2, 9),
          userId: user.id,
          username: user.username,
          color: user.color,
          text,
          timestamp: Date.now()
        };
        messages.push(message);
        
        // Keep only the last 100 messages in memory
        if (messages.length > 100) {
          messages.shift();
        }
        
        io.emit('message', message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      const user = users.get(socket.id);
      if (user) {
        users.delete(socket.id);
        io.emit('userLeft', socket.id);
        
        // Add a system message
        const systemMsg = {
          id: Math.random().toString(36).substring(2, 9),
          userId: 'system',
          username: 'System',
          color: '#9ca3af',
          text: `${user.username} left the server.`,
          timestamp: Date.now()
        };
        messages.push(systemMsg);
        io.emit('message', systemMsg);
      }
    });
  });

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static('dist'));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
