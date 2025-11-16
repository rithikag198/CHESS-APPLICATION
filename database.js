const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    rating: {
        type: Number,
        default: 1200
    },
    gamesPlayed: {
        type: Number,
        default: 0
    },
    gamesWon: {
        type: Number,
        default: 0
    },
    gamesLost: {
        type: Number,
        default: 0
    },
    gamesDrawn: {
        type: Number,
        default: 0
    },
    currentGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

const gameSchema = new mongoose.Schema({
    whitePlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blackPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    board: {
        type: String,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    },
    moves: [{
        from: String,
        to: String,
        piece: String,
        captured: String,
        promotion: String,
        san: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['waiting', 'playing', 'checkmate', 'stalemate', 'draw', 'resigned'],
        default: 'waiting'
    },
    currentTurn: {
        type: String,
        enum: ['white', 'black'],
        default: 'white'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    loser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    timeControl: {
        white: {
            type: Number,
            default: 600
        },
        black: {
            type: Number,
            default: 600
        }
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    format: {
        type: String,
        enum: ['swiss', 'round-robin', 'knockout'],
        required: true
    },
    timeControl: {
        type: Number,
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true
    },
    players: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['registration', 'in-progress', 'completed'],
        default: 'registration'
    },
    rounds: [{
        number: Number,
        games: [{
            white: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            black: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            result: {
                type: String,
                enum: ['white', 'black', 'draw', 'pending'],
                default: 'pending'
            }
        }]
    }],
    standings: [{
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: {
            type: Number,
            default: 0
        },
        wins: {
            type: Number,
            default: 0
        },
        losses: {
            type: Number,
            default: 0
        },
        draws: {
            type: Number,
            default: 0
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.updateRating = function(opponentRating, result) {
    const K = 32;
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - this.rating) / 400));
    const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    this.rating = Math.round(this.rating + K * (actualScore - expectedScore));
    
    this.gamesPlayed += 1;
    if (result === 'win') this.gamesWon += 1;
    else if (result === 'loss') this.gamesLost += 1;
    else this.gamesDrawn += 1;
};

gameSchema.methods.updateResult = function(result) {
    this.status = result === 'checkmate' ? 'checkmate' : result;
    this.endTime = new Date();
    
    if (result === 'checkmate' || result === 'resigned') {
        this.winner = this.currentTurn === 'white' ? this.blackPlayer : this.whitePlayer;
        this.loser = this.currentTurn === 'white' ? this.whitePlayer : this.blackPlayer;
    }
};

const User = mongoose.model('User', userSchema);
const Game = mongoose.model('Game', gameSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = {
    connect: async () => {
        try {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chess-app');
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('MongoDB connection error:', error);
        }
    },
    User,
    Game,
    Tournament
};
