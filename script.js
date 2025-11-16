class ChessGame {
    constructor() {
        this.game = new Chess();
        this.boardElement = document.getElementById('chessboard');
        this.gameStatusElement = document.getElementById('game-status');
        this.movesListElement = document.getElementById('moves-list');
        this.capturedWhiteElement = document.getElementById('captured-white');
        this.capturedBlackElement = document.getElementById('captured-black');
        this.whiteTimeElement = document.getElementById('white-time');
        this.blackTimeElement = document.getElementById('black-time');
        
        this.selectedSquare = null;
        this.isFlipped = false;
        this.capturedPieces = { white: [], black: [] };
        this.moveHistory = [];
        this.timers = { white: 600, black: 600 }; // 10 minutes each
        this.timerInterval = null;
        this.currentTimer = 'white';
        
        this.pieceUnicode = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.updateBoard();
        this.updateGameStatus();
        this.attachEventListeners();
        this.startTimer();
    }
    
    createBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const squareColor = (row + col) % 2 === 0 ? 'light' : 'dark';
                square.className = `square ${squareColor}`;
                
                const actualRow = this.isFlipped ? 7 - row : row;
                const actualCol = this.isFlipped ? 7 - col : col;
                const position = this.getPositionFromCoords(actualRow, actualCol);
                
                square.dataset.position = position;
                square.dataset.row = actualRow;
                square.dataset.col = actualCol;
                
                square.addEventListener('click', (e) => this.handleSquareClick(e));
                square.addEventListener('dragstart', (e) => this.handleDragStart(e));
                square.addEventListener('dragover', (e) => this.handleDragOver(e));
                square.addEventListener('drop', (e) => this.handleDrop(e));
                
                this.boardElement.appendChild(square);
            }
        }
    }
    
    getPositionFromCoords(row, col) {
        const files = 'abcdefgh';
        return files[col] + (8 - row);
    }
    
    getCoordsFromPosition(position) {
        const files = 'abcdefgh';
        const col = files.indexOf(position[0]);
        const row = 8 - parseInt(position[1]);
        return { row, col };
    }
    
    updateBoard() {
        const squares = this.boardElement.querySelectorAll('.square');
        
        squares.forEach(square => {
            square.innerHTML = '';
            square.classList.remove('selected', 'legal-move', 'capture');
            
            const position = square.dataset.position;
            const piece = this.game.get(position);
            
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.textContent = this.pieceUnicode[piece.type] + 
                    (piece.color === 'w' ? this.pieceUnicode[piece.type.toUpperCase()] : '');
                pieceElement.textContent = this.pieceUnicode[piece.type];
                pieceElement.draggable = piece.color === this.game.turn();
                square.appendChild(pieceElement);
            }
        });
        
        this.updateCapturedPieces();
        this.updateMoveHistory();
    }
    
    handleSquareClick(e) {
        const square = e.currentTarget;
        const position = square.dataset.position;
        
        if (this.selectedSquare) {
            const move = this.game.move({
                from: this.selectedSquare,
                to: position,
                promotion: 'q'
            });
            
            if (move) {
                this.moveHistory.push(move);
                this.handleMoveComplete(move);
            } else {
                this.clearSelection();
                if (this.game.get(position) && this.game.get(position).color === this.game.turn()) {
                    this.selectSquare(position);
                }
            }
        } else {
            const piece = this.game.get(position);
            if (piece && piece.color === this.game.turn()) {
                this.selectSquare(position);
            }
        }
    }
    
    handleDragStart(e) {
        const square = e.currentTarget;
        const position = square.dataset.position;
        const piece = this.game.get(position);
        
        if (piece && piece.color === this.game.turn()) {
            this.selectSquare(position);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', position);
        } else {
            e.preventDefault();
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    handleDrop(e) {
        e.preventDefault();
        const fromPosition = e.dataTransfer.getData('text/plain');
        const toSquare = e.currentTarget;
        const toPosition = toSquare.dataset.position;
        
        const move = this.game.move({
            from: fromPosition,
            to: toPosition,
            promotion: 'q'
        });
        
        if (move) {
            this.moveHistory.push(move);
            this.handleMoveComplete(move);
        } else {
            this.clearSelection();
        }
    }
    
    selectSquare(position) {
        this.clearSelection();
        this.selectedSquare = position;
        
        const square = this.boardElement.querySelector(`[data-position="${position}"]`);
        square.classList.add('selected');
        
        const moves = this.game.moves({ 
            square: position, 
            verbose: true 
        });
        
        moves.forEach(move => {
            const targetSquare = this.boardElement.querySelector(`[data-position="${move.to}"]`);
            if (targetSquare) {
                targetSquare.classList.add('legal-move');
                if (move.captured) {
                    targetSquare.classList.add('capture');
                }
            }
        });
    }
    
    clearSelection() {
        this.selectedSquare = null;
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'legal-move', 'capture');
        });
    }
    
    handleMoveComplete(move) {
        this.clearSelection();
        this.updateBoard();
        this.updateGameStatus();
        
        if (move.captured) {
            const capturedColor = move.color === 'w' ? 'black' : 'white';
            this.capturedPieces[capturedColor].push(move.captured);
        }
        
        this.switchTimer();
        
        if (this.game.in_checkmate()) {
            this.endGame('checkmate');
        } else if (this.game.in_stalemate()) {
            this.endGame('stalemate');
        } else if (this.game.in_draw()) {
            this.endGame('draw');
        } else if (this.game.in_check()) {
            this.showNotification('Check!');
        }
    }
    
    updateGameStatus() {
        const turn = this.game.turn() === 'w' ? 'White' : 'Black';
        let status = `${turn} to move`;
        
        if (this.game.in_check()) {
            status += ' (Check)';
        }
        
        this.gameStatusElement.textContent = status;
    }
    
    updateCapturedPieces() {
        this.capturedWhiteElement.innerHTML = this.capturedPieces.white
            .map(piece => this.pieceUnicode[piece])
            .join(' ');
        
        this.capturedBlackElement.innerHTML = this.capturedPieces.black
            .map(piece => this.pieceUnicode[piece.toUpperCase()])
            .join(' ');
    }
    
    updateMoveHistory() {
        const moves = this.game.history({ verbose: true });
        let html = '';
        
        for (let i = 0; i < moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            html += `<div class="move-pair">`;
            html += `<span class="move-number">${moveNumber}.</span>`;
            html += `<span>${moves[i].san}</span>`;
            
            if (i + 1 < moves.length) {
                html += ` <span>${moves[i + 1].san}</span>`;
            }
            
            html += `</div>`;
        }
        
        this.movesListElement.innerHTML = html;
        this.movesListElement.scrollTop = this.movesListElement.scrollHeight;
    }
    
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (this.timers[this.currentTimer] > 0) {
                this.timers[this.currentTimer]--;
                this.updateTimerDisplay();
            } else {
                this.endGame('timeout');
            }
        }, 1000);
    }
    
    switchTimer() {
        this.currentTimer = this.currentTimer === 'white' ? 'black' : 'white';
    }
    
    updateTimerDisplay() {
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        };
        
        this.whiteTimeElement.textContent = formatTime(this.timers.white);
        this.blackTimeElement.textContent = formatTime(this.timers.black);
    }
    
    flipBoard() {
        this.isFlipped = !this.isFlipped;
        this.createBoard();
        this.updateBoard();
    }
    
    undoMove() {
        if (this.moveHistory.length > 0) {
            const move = this.moveHistory.pop();
            this.game.undo();
            
            if (move.captured) {
                const capturedColor = move.color === 'w' ? 'black' : 'white';
                this.capturedPieces[capturedColor].pop();
            }
            
            this.switchTimer();
            this.clearSelection();
            this.updateBoard();
            this.updateGameStatus();
        }
    }
    
    newGame() {
        this.game.reset();
        this.selectedSquare = null;
        this.capturedPieces = { white: [], black: [] };
        this.moveHistory = [];
        this.timers = { white: 600, black: 600 };
        this.currentTimer = 'white';
        
        this.clearSelection();
        this.updateBoard();
        this.updateGameStatus();
        this.startTimer();
    }
    
    endGame(reason) {
        clearInterval(this.timerInterval);
        
        let message = '';
        switch (reason) {
            case 'checkmate':
                const winner = this.game.turn() === 'w' ? 'Black' : 'White';
                message = `Checkmate! ${winner} wins!`;
                break;
            case 'stalemate':
                message = 'Stalemate! Draw!';
                break;
            case 'draw':
                message = 'Draw!';
                break;
            case 'timeout':
                const timeoutWinner = this.currentTimer === 'white' ? 'Black' : 'White';
                message = `Time out! ${timeoutWinner} wins!`;
                break;
        }
        
        this.gameStatusElement.textContent = message;
        this.showNotification(message);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2c3e50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    attachEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('flip-board-btn').addEventListener('click', () => this.flipBoard());
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undoMove();
            }
            if (e.key === 'f') {
                this.flipBoard();
            }
            if (e.key === 'n') {
                this.newGame();
            }
        });
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});
