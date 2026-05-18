const { socket } = require('socket.io');
const validateMessage = require('../utils/validateMessage');

const users = new Map();
const messageHistory = [];

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.emit('message history', messageHistory);

        socket.on('user join', (username) => {
            users.set(socket.id, username);

            io.emit('user joined', {
                user: username,
                time: new Date().toISOString()
            });
        });
        socket.on('chat message', (msg) => {
            if (!validateMessage(msg)) {
                socket.emit('error message', 'Invalid message');
                return;
            }

            const username = users.get(socket.id) || 'Anonymous';

            const messageData = {
                user: username,
                text: msg,
                time: new Date().toLocaleDateString()
            };

            messageHistory.push(messageData);
            io.emit('chat message', messageData);
        });
        socket.on('typing', () => {
            const username = users.get(socket.id);
            socket.broadcast.emit('user typing', username);
        });

        socket.on('stop typing', () => {
            const username = users.get('socket.id');
            socket.broadcast.emit('user stop typing', username);
        });

        socket.on('disconnect', () => {
            const username = users.get(socket.id);

            if (username) {
                io.emit('user left', {
                    user: username,
                    time: new Date().toDateString()
                });
            }
            users.delete(socket.id);
            console.log('User disconnected:', socket.id);

        });
        socket.on('error', (err) => {
            console.error('Socket error:', err);
            socket.emit('error message', 'something went wrong');
        });
    });
};