/**
 * Chess Application Backend Server
 * 
 * Developed as a full-stack demonstration project.
 * This server handles API endpoints, WebSocket connections,
 * authentication, and real-time multiplayer functionality.
 * 
 * Author: [Your Name]
 * Created: [Current Date]
 * Version: 1.0.0
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Type', req.path.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8');
    }
    next();
});
app.use(express.static(path.join(__dirname)));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

const games = new Map();
const users = new Map();

class Game {
    constructor(id) {
        this.id = id;
        this.players = [];
        this.board = null;
        this.currentTurn = 'white';
        this.moves = [];
        this.status = 'waiting';
        this.createdAt = new Date();
    }

    addPlayer(playerId, username) {
        if (this.players.length < 2) {
            const color = this.players.length === 0 ? 'white' : 'black';
            this.players.push({ id: playerId, username, color });
            
            if (this.players.length === 2) {
                this.status = 'playing';
                this.board = new (require('chess.js').Chess)();
            }
            return true;
        }
        return false;
    }

    makeMove(move) {
        if (this.board && this.board.move(move)) {
            this.moves.push(move);
            this.currentTurn = this.board.turn() === 'w' ? 'white' : 'black';
            
            if (this.board.in_checkmate()) {
                this.status = 'checkmate';
            } else if (this.board.in_stalemate()) {
                this.status = 'stalemate';
            } else if (this.board.in_draw()) {
                this.status = 'draw';
            }
            
            return true;
        }
        return false;
    }

    getGameState() {
        return {
            id: this.id,
            players: this.players,
            board: this.board ? this.board.fen() : null,
            currentTurn: this.currentTurn,
            moves: this.moves,
            status: this.status,
            createdAt: this.createdAt
        };
    }
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register', (username) => {
        users.set(socket.id, { username, gameId: null });
        socket.emit('registered', { userId: socket.id, username });
    });

    socket.on('createGame', () => {
        const gameId = generateGameId();
        const game = new Game(gameId);
        games.set(gameId, game);
        
        socket.emit('gameCreated', { gameId });
        socket.join(gameId);
    });

    socket.on('joinGame', (gameId) => {
        const game = games.get(gameId);
        const user = users.get(socket.id);
        
        if (game && user && game.addPlayer(socket.id, user.username)) {
            user.gameId = gameId;
            socket.join(gameId);
            
            io.to(gameId).emit('gameState', game.getGameState());
            socket.emit('joinedGame', { gameId, color: game.players[game.players.length - 1].color });
        } else {
            socket.emit('error', { message: 'Cannot join game' });
        }
    });

    socket.on('makeMove', (data) => {
        const user = users.get(socket.id);
        const game = games.get(user.gameId);
        
        if (game && game.makeMove(data.move)) {
            io.to(user.gameId).emit('gameState', game.getGameState());
            io.to(user.gameId).emit('moveMade', { move: data.move, player: socket.id });
        } else {
            socket.emit('error', { message: 'Invalid move' });
        }
    });

    socket.on('getAvailableGames', () => {
        const availableGames = Array.from(games.values())
            .filter(game => game.status === 'waiting')
            .map(game => ({
                id: game.id,
                players: game.players.length,
                createdAt: game.createdAt
            }));
        
        socket.emit('availableGames', availableGames);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const user = users.get(socket.id);
        
        if (user && user.gameId) {
            const game = games.get(user.gameId);
            if (game) {
                game.players = game.players.filter(p => p.id !== socket.id);
                
                if (game.players.length === 0) {
                    games.delete(user.gameId);
                } else {
                    game.status = 'waiting';
                    io.to(user.gameId).emit('playerDisconnected', { playerId: socket.id });
                    io.to(user.gameId).emit('gameState', game.getGameState());
                }
            }
        }
        
        users.delete(socket.id);
    });
});

function generateGameId() {
    return Math.random().toString(36).substr(2, 9);
}

app.get('/api/games', (req, res) => {
    const availableGames = Array.from(games.values())
        .filter(game => game.status === 'waiting')
        .map(game => ({
            id: game.id,
            players: game.players.length,
            createdAt: game.createdAt
        }));
    
    res.json(availableGames);
});

app.get('/api/game/:id', (req, res) => {
    const game = games.get(req.params.id);
    if (game) {
        res.json(game.getGameState());
    } else {
        res.status(404).json({ error: 'Game not found' });
    }
});

app.get('/api/stats', (req, res) => {
    res.json({
        totalGames: games.size,
        activeUsers: users.size,
        waitingGames: Array.from(games.values()).filter(g => g.status === 'waiting').length,
        playingGames: Array.from(games.values()).filter(g => g.status === 'playing').length
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Chess server running on port ${PORT}`);
});

module.exports = { app, server, io };
