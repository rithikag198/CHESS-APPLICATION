const { Chess } = require('chess.js');

class ChessAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.depth = this.getDepthByDifficulty(difficulty);
        this.maxThinkTime = this.getThinkTimeByDifficulty(difficulty);
    }

    getDepthByDifficulty(difficulty) {
        const depths = {
            'easy': 1,
            'medium': 2,
            'hard': 3,
            'expert': 4
        };
        return depths[difficulty] || 2;
    }

    getThinkTimeByDifficulty(difficulty) {
        const times = {
            'easy': 500,
            'medium': 1000,
            'hard': 2000,
            'expert': 3000
        };
        return times[difficulty] || 1000;
    }

    getBestMove(fen, callback) {
        const game = new Chess(fen);
        const moves = game.moves({ verbose: true });
        
        if (moves.length === 0) {
            callback(null);
            return;
        }

        const startTime = Date.now();
        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of moves) {
            game.move(move);
            const score = this.minimax(game, this.depth, -Infinity, Infinity, false);
            game.undo();

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }

            if (Date.now() - startTime > this.maxThinkTime) {
                break;
            }
        }

        callback(bestMove);
    }

    minimax(game, depth, alpha, beta, isMaximizing) {
        if (depth === 0 || game.in_checkmate() || game.in_draw() || game.in_stalemate()) {
            return this.evaluatePosition(game);
        }

        const moves = game.moves({ verbose: true });

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                game.move(move);
                const score = this.minimax(game, depth - 1, alpha, beta, false);
                game.undo();
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                game.move(move);
                const score = this.minimax(game, depth - 1, alpha, beta, true);
                game.undo();
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    evaluatePosition(game) {
        if (game.in_checkmate()) {
            return game.turn() === 'w' ? -10000 : 10000;
        }

        if (game.in_draw() || game.in_stalemate()) {
            return 0;
        }

        let score = 0;
        const board = game.board();

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceValue = this.getPieceValue(piece);
                    const positionValue = this.getPositionValue(piece, row, col);
                    const totalValue = pieceValue + positionValue;
                    
                    if (piece.color === 'w') {
                        score += totalValue;
                    } else {
                        score -= totalValue;
                    }
                }
            }
        }

        if (game.in_check()) {
            score += game.turn() === 'w' ? -50 : 50;
        }

        return score;
    }

    getPieceValue(piece) {
        const values = {
            'p': 100,
            'n': 320,
            'b': 330,
            'r': 500,
            'q': 900,
            'k': 20000
        };
        return values[piece.type] || 0;
    }

    getPositionValue(piece, row, col) {
        const pieceType = piece.type;
        const color = piece.color;
        const adjustedRow = color === 'w' ? row : 7 - row;

        const pawnTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];

        const knightTable = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];

        const bishopTable = [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ];

        const rookTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [0,  0,  0,  5,  5,  0,  0,  0]
        ];

        const queenTable = [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [-5,  0,  5,  5,  5,  5,  0, -5],
            [0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ];

        const kingMiddleTable = [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [20, 20,  0,  0,  0,  0, 20, 20],
            [20, 30, 10,  0,  0, 10, 30, 20]
        ];

        let table;
        switch (pieceType) {
            case 'p': table = pawnTable; break;
            case 'n': table = knightTable; break;
            case 'b': table = bishopTable; break;
            case 'r': table = rookTable; break;
            case 'q': table = queenTable; break;
            case 'k': table = kingMiddleTable; break;
            default: return 0;
        }

        return table[adjustedRow][col] || 0;
    }

    getRandomMove(fen) {
        const game = new Chess(fen);
        const moves = game.moves({ verbose: true });
        
        if (moves.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
    }

    getOpeningMove(fen) {
        const game = new Chess(fen);
        const moveCount = game.history().length;

        const openings = {
            0: { from: 'e2', to: 'e4' },
            1: { from: 'd2', to: 'd4' },
            2: { from: 'g1', to: 'f3' }
        };

        if (moveCount < 3 && openings[moveCount]) {
            const opening = openings[moveCount];
            const move = game.moves({ verbose: true })
                .find(m => m.from === opening.from && m.to === opening.to);
            
            if (move) {
                return move;
            }
        }

        return null;
    }
}

module.exports = ChessAI;
