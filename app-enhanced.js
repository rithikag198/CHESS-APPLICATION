class ChessGameEnhanced {
    constructor() {
        this.game = new Chess();
        this.boardElement = document.getElementById('chessboard');
        this.gameStatusElement = document.getElementById('game-status');
        this.movesListElement = document.getElementById('moves-list');
        this.capturedWhiteElement = document.getElementById('captured-white');
        this.capturedBlackElement = document.getElementById('captured-black');
        this.whiteTimeElement = document.getElementById('white-time');
        this.blackTimeElement = $('#black-time');
        
        this.selectedSquare = null;
        this.isFlipped = false;
        this.capturedPieces = { white: [], black: [] };
        this.moveHistory = [];
        this.timers = { white: 600, black: 600 };
        this.timerInterval = null;
        this.currentTimer = 'white';
        this.gameMode = 'local'; // 'local', 'ai', 'online'
        this.aiDifficulty = 'medium';
        this.socket = null;
        this.gameId = null;
        this.playerColor = null;
        this.currentUser = null;
        
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
        this.setupSocketConnection();
        this.loadUserFromToken();
    }
    
    setupSocketConnection() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus(true);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('gameState', (gameState) => {
            this.syncGameState(gameState);
        });
        
        this.socket.on('moveMade', (data) => {
            if (data.player !== this.socket.id) {
                this.handleOpponentMove(data.move);
            }
        });
        
        this.socket.on('gameCreated', (data) => {
            this.gameId = data.gameId;
            this.showNotification(`Game created: ${data.gameId}`);
        });
        
        this.socket.on('joinedGame', (data) => {
            this.gameId = data.gameId;
            this.playerColor = data.color;
            this.gameMode = 'online';
            this.showNotification(`Joined game as ${data.color}`);
        });
        
        this.socket.on('playerDisconnected', (data) => {
            this.showNotification('Opponent disconnected');
        });
        
        this.socket.on('error', (data) => {
            this.showNotification(`Error: ${data.message}`);
        });
    }
    
    loadUserFromToken() {
        const token = localStorage.getItem('chessToken');
        if (token) {
            fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    this.currentUser = data.user;
                    this.updateUserInterface();
                }
            })
            .catch(error => console.error('Failed to load user:', error));
        }
    }
    
    updateUserInterface() {
        if (this.currentUser) {
            document.getElementById('user-info').innerHTML = `
                <div class="user-profile">
                    <span class="username">${this.currentUser.username}</span>
                    <span class="rating">ELO: ${this.currentUser.rating}</span>
                    <button onclick="chessGame.logout()">Logout</button>
                </div>
            `;
        }
    }
    
    createOnlineGame() {
        if (!this.currentUser) {
            this.showNotification('Please login to create online games');
            return;
        }
        
        this.socket.emit('createGame');
    }
    
    joinOnlineGame(gameId) {
        if (!this.currentUser) {
            this.showNotification('Please login to join online games');
            return;
        }
        
        this.socket.emit('joinGame', gameId);
    }
    
    syncGameState(gameState) {
        this.game.load(gameState.board);
        this.moveHistory = gameState.moves;
        this.updateBoard();
        this.updateGameStatus();
        this.updateMoveHistory();
    }
    
    handleOpponentMove(move) {
        this.game.move(move);
        this.moveHistory.push(move);
        this.clearSelection();
        this.updateBoard();
        this.updateGameStatus();
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
    
    setGameMode(mode) {
        this.gameMode = mode;
        this.newGame();
        
        if (mode === 'ai') {
            this.showNotification(`AI mode - ${this.aiDifficulty} difficulty`);
        } else if (mode === 'online') {
            this.showNotification('Online multiplayer mode');
        } else {
            this.showNotification('Local multiplayer mode');
        }
    }
    
    setAIDifficulty(difficulty) {
        this.aiDifficulty = difficulty;
        if (this.gameMode === 'ai') {
            this.showNotification(`AI difficulty set to ${difficulty}`);
        }
    }
    
    makeAIMove() {
        if (this.gameMode !== 'ai' || this.game.turn() !== 'b') {
            return;
        }
        
        setTimeout(() => {
            const ai = new ChessAI(this.aiDifficulty);
            ai.getBestMove(this.game.fen(), (move) => {
                if (move) {
                    const gameMove = this.game.move({
                        from: move.from,
                        to: move.to,
                        promotion: move.promotion
                    });
                    
                    if (gameMove) {
                        this.moveHistory.push(gameMove);
                        this.handleMoveComplete(gameMove);
                    }
                }
            });
        }, 1000);
    }
    
    handleSquareClick(e) {
        if (this.gameMode === 'online' && this.isMyTurn() === false) {
            return;
        }
        
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
                if (this.gameMode === 'online') {
                    this.socket.emit('makeMove', { move });
                }
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
    
    isMyTurn() {
        if (this.gameMode === 'online' && this.playerColor) {
            const currentTurn = this.game.turn() === 'w' ? 'white' : 'black';
            return currentTurn === this.playerColor;
        }
        return true;
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
        
        if (this.gameMode === 'ai' && this.game.turn() === 'b') {
            this.makeAIMove();
        }
    }
    
    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = connected ? 'Connected' : 'Disconnected';
            statusElement.className = connected ? 'connected' : 'disconnected';
        }
    }
    
    attachEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('flip-board-btn').addEventListener('click', () => this.flipBoard());
        
        document.getElementById('create-game-btn')?.addEventListener('click', () => this.createOnlineGame());
        document.getElementById('join-game-btn')?.addEventListener('click', () => {
            const gameId = prompt('Enter game ID:');
            if (gameId) this.joinOnlineGame(gameId);
        });
        
        document.getElementById('ai-mode-btn')?.addEventListener('click', () => this.setGameMode('ai'));
        document.getElementById('local-mode-btn')?.addEventListener('click', () => this.setGameMode('local'));
        document.getElementById('online-mode-btn')?.addEventListener('click', () => this.setGameMode('online'));
        
        document.getElementById('ai-difficulty')?.addEventListener('change', (e) => {
            this.setAIDifficulty(e.target.value);
        });
        
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
    
    logout() {
        localStorage.removeItem('chessToken');
        this.currentUser = null;
        this.updateUserInterface();
        this.showNotification('Logged out successfully');
    }
    
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Login</h2>
                <form id="login-form">
                    <input type="email" id="login-email" placeholder="Email" required>
                    <input type="password" id="login-password" placeholder="Password" required>
                    <button type="submit">Login</button>
                    <button type="button" onclick="chessGame.showRegisterModal()">Register</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }
    
    showRegisterModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Register</h2>
                <form id="register-form">
                    <input type="text" id="register-username" placeholder="Username" required>
                    <input type="email" id="register-email" placeholder="Email" required>
                    <input type="password" id="register-password" placeholder="Password" required>
                    <button type="submit">Register</button>
                    <button type="button" onclick="chessGame.showLoginModal()">Login</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }
    
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('chessToken', data.token);
                this.currentUser = data.user;
                this.updateUserInterface();
                this.closeModal();
                this.showNotification('Login successful');
            } else {
                this.showNotification(data.error || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            this.showNotification('Login failed');
        });
    }
    
    handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('chessToken', data.token);
                this.currentUser = data.user;
                this.updateUserInterface();
                this.closeModal();
                this.showNotification('Registration successful');
            } else {
                this.showNotification(data.error || 'Registration failed');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            this.showNotification('Registration failed');
        });
    }
    
    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
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
                pieceElement.textContent = this.pieceUnicode[piece.type];
                pieceElement.draggable = piece.color === this.game.turn() && this.isMyTurn();
                square.appendChild(pieceElement);
            }
        });
        
        this.updateCapturedPieces();
        this.updateMoveHistory();
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
    
    updateGameStatus() {
        const turn = this.game.turn() === 'w' ? 'White' : 'Black';
        let status = `${turn} to move`;
        
        if (this.game.in_check()) {
            status += ' (Check)';
        }
        
        if (this.gameMode === 'online' && this.playerColor) {
            const currentTurn = this.game.turn() === 'w' ? 'white' : 'black';
            status += ` - ${currentTurn === this.playerColor ? 'Your' : "Opponent's"} turn`;
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
        if (this.moveHistory.length > 0 && this.gameMode !== 'online') {
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
        
        if (this.gameMode === 'ai' && this.game.turn() === 'b') {
            this.makeAIMove();
        }
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
    
    handleDragStart(e) {
        const square = e.currentTarget;
        const position = square.dataset.position;
        const piece = this.game.get(position);
        
        if (piece && piece.color === this.game.turn() && this.isMyTurn()) {
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
            if (this.gameMode === 'online') {
                this.socket.emit('makeMove', { move });
            }
            this.handleMoveComplete(move);
        } else {
            this.clearSelection();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGameEnhanced();
});
