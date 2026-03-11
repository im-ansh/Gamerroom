import { Server } from 'socket.io';

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO on Vercel');
    const io = new Server(res.socket.server, {
      path: '/socket.io/',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // In-memory state (Note: Vercel serverless functions are stateless, 
    // so this will reset on cold starts and won't sync across multiple instances)
    const users = new Map();
    const messages: any[] = [];
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
        
        socket.emit('init', {
          users: Array.from(users.values()),
          messages: messages.slice(-50)
        });

        socket.broadcast.emit('userJoined', user);
        
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
          if (messages.length > 100) messages.shift();
          io.emit('message', message);
        }
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const user = users.get(socket.id);
        if (user) {
          users.delete(socket.id);
          io.emit('userLeft', socket.id);
          
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

    res.socket.server.io = io;
  }
  res.end();
}
