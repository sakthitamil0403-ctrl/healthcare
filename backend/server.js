require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// Expose socket.io to routes
app.set('io', io);

// Health Check
app.get('/', (req, res) => {
    res.json({ 
        status: 'HealthHub AI Platform Online', 
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/sync', require('./routes/sync'));
app.use('/api/milk', require('./routes/milk'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/admin', require('./routes/admin'));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('updateLocation', (data) => {
        // Broadcast donor location updates
        io.emit('donorLocationUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
