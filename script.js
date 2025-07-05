class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp'; // 'pvp' for Player vs Player, 'pva' for Player vs AI
        this.humanPlayer = 'X';
        this.aiPlayer = 'O';
        this.scores = { X: 0, O: 0, draw: 0 };
        
        // Enhanced game state tracking
        this.gameState = {
            moves: [],
            winner: null,
            winningCombination: null,
            totalMoves: 0,
            gameStartTime: null,
            gameEndTime: null,
            isDraw: false
        };
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.resetButton = document.getElementById('resetBtn');
        this.gameModeSelect = document.getElementById('gameMode');
        this.player1Label = document.getElementById('player1Label');
        this.player2Label = document.getElementById('player2Label');
        this.scoreElements = {
            X: document.getElementById('scoreX'),
            O: document.getElementById('scoreO'),
            draw: document.getElementById('scoreDraw')
        };

        this.cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });

        this.resetButton.addEventListener('click', this.resetGame.bind(this));
        this.gameModeSelect.addEventListener('change', this.handleModeChange.bind(this));
        
        this.updateDisplay();
        this.updateLabels();
    }

    handleModeChange() {
        this.gameMode = this.gameModeSelect.value;
        this.resetGame();
        this.updateLabels();
    }

    updateLabels() {
        if (this.gameMode === 'pva') {
            this.player1Label.textContent = 'You (X)';
            this.player2Label.textContent = 'AI (O)';
        } else {
            this.player1Label.textContent = 'Player X';
            this.player2Label.textContent = 'Player O';
        }
    }

    handleCellClick(event) {
        const cellIndex = parseInt(event.target.dataset.index);

        // Enhanced click validation with detailed logging
        if (!this.isValidMove(cellIndex)) {
            this.logInvalidMove(cellIndex);
            return;
        }

        // In AI mode, only allow human player moves
        if (this.gameMode === 'pva' && this.currentPlayer === this.aiPlayer) {
            this.gameStatusElement.textContent = 'Wait for AI turn!';
            return;
        }

        this.makeMove(cellIndex);

        // After human move in AI mode, make AI move
        if (this.gameMode === 'pva' && this.gameActive && this.currentPlayer === this.aiPlayer) {
            setTimeout(() => {
                this.makeAIMove();
            }, 500); // Small delay for better UX
        }
    }

    isValidMove(cellIndex) {
        // Check if cell index is valid
        if (cellIndex < 0 || cellIndex > 8) {
            return false;
        }
        
        // Check if cell is already occupied
        if (this.board[cellIndex] !== '') {
            return false;
        }
        
        // Check if game is still active
        if (!this.gameActive) {
            return false;
        }
        
        return true;
    }

    logInvalidMove(cellIndex) {
        if (cellIndex < 0 || cellIndex > 8) {
            console.log('Invalid cell index:', cellIndex);
        } else if (this.board[cellIndex] !== '') {
            console.log('Cell already occupied:', cellIndex, 'by', this.board[cellIndex]);
            this.gameStatusElement.textContent = 'Cell already taken!';
            setTimeout(() => {
                if (this.gameActive) {
                    this.gameStatusElement.textContent = 'Make your move!';
                }
            }, 1000);
        } else if (!this.gameActive) {
            console.log('Game is not active');
            this.gameStatusElement.textContent = 'Game is over!';
        }
    }

    makeMove(cellIndex) {
        // Record move in game state
        const moveData = {
            player: this.currentPlayer,
            position: cellIndex,
            timestamp: Date.now(),
            moveNumber: this.gameState.totalMoves + 1
        };

        this.gameState.moves.push(moveData);
        this.gameState.totalMoves++;

        // Set game start time on first move
        if (this.gameState.moves.length === 1) {
            this.gameState.gameStartTime = Date.now();
        }

        // Update board
        this.board[cellIndex] = this.currentPlayer;
        this.updateCellDisplay(cellIndex);

        console.log(`Move ${moveData.moveNumber}: Player ${this.currentPlayer} at position ${cellIndex}`);

        // Check for winning conditions
        const winResult = this.checkForWin();
        if (winResult.hasWinner) {
            this.handleWin(winResult);
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }

        this.updateDisplay();
        this.logGameState();
    }

    checkForWin() {
        for (let i = 0; i < this.winningConditions.length; i++) {
            const condition = this.winningConditions[i];
            const [a, b, c] = condition;
            
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                return {
                    hasWinner: true,
                    winner: this.board[a],
                    winningCombination: condition,
                    winType: this.getWinType(condition)
                };
            }
        }
        
        return { hasWinner: false };
    }

    getWinType(combination) {
        const [a, b, c] = combination;
        
        // Check for rows
        if ((a === 0 && b === 1 && c === 2) || 
            (a === 3 && b === 4 && c === 5) || 
            (a === 6 && b === 7 && c === 8)) {
            return 'row';
        }
        
        // Check for columns
        if ((a === 0 && b === 3 && c === 6) || 
            (a === 1 && b === 4 && c === 7) || 
            (a === 2 && b === 5 && c === 8)) {
            return 'column';
        }
        
        // Must be diagonal
        return 'diagonal';
    }

    handleWin(winResult) {
        this.gameState.winner = winResult.winner;
        this.gameState.winningCombination = winResult.winningCombination;
        this.gameState.gameEndTime = Date.now();
        
        console.log(`🎉 Game won by ${winResult.winner}!`);
        console.log(`Win type: ${winResult.winType}`);
        console.log(`Winning combination: [${winResult.winningCombination.join(', ')}]`);
        console.log(`Game duration: ${this.getGameDuration()}ms`);
        
        this.endGame(this.getWinMessage());
        this.scores[this.currentPlayer]++;
        this.highlightWinningCells(winResult.winningCombination);
    }

    handleDraw() {
        this.gameState.isDraw = true;
        this.gameState.gameEndTime = Date.now();
        
        console.log('🤝 Game ended in a draw!');
        console.log(`Game duration: ${this.getGameDuration()}ms`);
        console.log(`Total moves: ${this.gameState.totalMoves}`);
        
        this.endGame("It's a draw!");
        this.scores.draw++;
    }

    getGameDuration() {
        if (this.gameState.gameStartTime && this.gameState.gameEndTime) {
            return this.gameState.gameEndTime - this.gameState.gameStartTime;
        }
        return 0;
    }

    logGameState() {
        console.log('Current Game State:', {
            board: this.board,
            currentPlayer: this.currentPlayer,
            totalMoves: this.gameState.totalMoves,
            gameActive: this.gameActive,
            moves: this.gameState.moves
        });
    }

    getWinMessage() {
        if (this.gameMode === 'pva') {
            return this.currentPlayer === this.humanPlayer ? 'You win! 🎉' : 'AI wins! 🤖';
        } else {
            return `Player ${this.currentPlayer} wins! 🎉`;
        }
    }

    makeAIMove() {
        if (!this.gameActive) return;

        const bestMove = this.getBestMove();
        if (bestMove !== -1) {
            this.makeMove(bestMove);
        }
    }

    getBestMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = this.aiPlayer;
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Block human from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = this.humanPlayer;
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Take center if available
        if (this.board[4] === '') {
            return 4;
        }

        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // Take any available space
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                availableMoves.push(i);
            }
        }

        return availableMoves.length > 0 ? 
            availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }

    updateCellDisplay(cellIndex) {
        const cell = this.cells[cellIndex];
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        cell.disabled = true;
    }

    checkWinner() {
        // Use the enhanced win checking method
        return this.checkForWin().hasWinner;
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    highlightWinningCells(winningCombination = null) {
        if (winningCombination) {
            // Highlight specific winning combination
            winningCombination.forEach(index => {
                this.cells[index].classList.add('winning');
            });
            console.log(`Highlighted winning cells: [${winningCombination.join(', ')}]`);
        } else {
            // Fallback: find and highlight all winning combinations
            this.winningConditions.forEach(condition => {
                const [a, b, c] = condition;
                if (this.board[a] && 
                    this.board[a] === this.board[b] && 
                    this.board[a] === this.board[c]) {
                    [a, b, c].forEach(index => {
                        this.cells[index].classList.add('winning');
                    });
                }
            });
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    endGame(message) {
        this.gameActive = false;
        this.gameStatusElement.textContent = message;
        this.currentPlayerElement.textContent = 'Game Over';
        
        // Disable all cells
        this.cells.forEach(cell => {
            cell.disabled = true;
        });
    }

    updateDisplay() {
        if (this.gameActive) {
            if (this.gameMode === 'pva') {
                if (this.currentPlayer === this.humanPlayer) {
                    this.currentPlayerElement.textContent = 'Your Turn';
                    this.gameStatusElement.textContent = 'Make your move!';
                } else {
                    this.currentPlayerElement.textContent = 'AI Turn';
                    this.gameStatusElement.textContent = 'AI is thinking...';
                }
            } else {
                this.currentPlayerElement.textContent = `Player ${this.currentPlayer}'s Turn`;
                this.gameStatusElement.textContent = 'Make your move!';
            }
        }

        // Update scores
        this.scoreElements.X.textContent = this.scores.X;
        this.scoreElements.O.textContent = this.scores.O;
        this.scoreElements.draw.textContent = this.scores.draw;
    }

    resetGame() {
        // Log previous game summary if there was one
        if (this.gameState.moves.length > 0) {
            console.log('=== GAME SUMMARY ===');
            console.log('Final board state:', this.board);
            console.log('Total moves:', this.gameState.totalMoves);
            console.log('Winner:', this.gameState.winner || 'Draw');
            console.log('Duration:', this.getGameDuration() + 'ms');
            console.log('Move history:', this.gameState.moves);
            console.log('==================');
        }

        // Reset board and game state
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;

        // Reset enhanced game state
        this.gameState = {
            moves: [],
            winner: null,
            winningCombination: null,
            totalMoves: 0,
            gameStartTime: null,
            gameEndTime: null,
            isDraw: false
        };

        // Reset UI
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.disabled = false;
            cell.classList.remove('x', 'o', 'winning');
        });

        console.log('🔄 New game started!');
        this.updateDisplay();
        this.updateLabels();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});