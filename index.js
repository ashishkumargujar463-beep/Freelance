const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Model imports for socket operations
const Chat = require('./models/Chat');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SB Works FreelanceHub API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Socket.IO Real-time Chat & Notification Engine
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Join a project room
  socket.on('joinRoom', ({ projectId, user }) => {
    const room = `project_${projectId}`;
    socket.join(room);
    console.log(`User ${user?.username || socket.id} joined room: ${room}`);
    socket.to(room).emit('userJoined', { user, message: `${user?.username || 'User'} is active in chat.` });
  });

  // Leave a project room
  socket.on('leaveRoom', ({ projectId, user }) => {
    const room = `project_${projectId}`;
    socket.leave(room);
    console.log(`User ${user?.username || socket.id} left room: ${room}`);
  });

  // Real-time Chat message
  socket.on('sendMessage', async ({ projectId, sender, text, fileUrl }) => {
    try {
      const room = `project_${projectId}`;
      const messageData = {
        sender: {
          _id: sender._id,
          username: sender.username,
          avatar: sender.avatar,
          role: sender.role,
        },
        text,
        fileUrl: fileUrl || '',
        sentAt: new Date(),
      };

      // Broadcast to everyone in the room (including sender)
      io.to(room).emit('receiveMessage', {
        projectId,
        message: messageData,
      });
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  // Typing indicator
  socket.on('typing', ({ projectId, username, isTyping }) => {
    const room = `project_${projectId}`;
    socket.to(room).emit('userTyping', { username, isTyping });
  });

  // Notification broadcast
  socket.on('sendNotification', ({ recipientId, notification }) => {
    io.emit(`notification_${recipientId}`, notification);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 6001;

server.listen(PORT, () => {
  console.log(`SB Works Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
