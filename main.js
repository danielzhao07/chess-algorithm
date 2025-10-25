// Chess piece Unicode characters
const PIECES = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

// Game state
let board = [];
let selectedSquare = null;
let currentTurn = 'white';
let moveHistory = [];
let capturedPieces = { white: [], black: [] };

// Initialize the board with starting positions
function initializeBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Black pieces (top)
    board[0] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(piece => ({ type: piece, color: 'black' }));
    board[1] = Array(8).fill({ type: 'pawn', color: 'black' });
    
    // White pieces (bottom)
    board[6] = Array(8).fill({ type: 'pawn', color: 'white' });
    board[7] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(piece => ({ type: piece, color: 'white' }));
}

// Create the visual board
function createBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = board[row][col];
            if (piece) {
                square.textContent = PIECES[piece.color][piece.type];
                square.dataset.piece = piece.type;
                square.dataset.color = piece.color;
            }
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            chessboard.appendChild(square);
        }
    }
}

// Handle square clicks
function handleSquareClick(row, col) {
    const square = board[row][col];
    
    if (selectedSquare) {
        // Try to move the piece
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            clearSelection();
            switchTurn();
            updateDisplay();
        } else {
            clearSelection();
            // If clicking on own piece, select it
            if (square && square.color === currentTurn) {
                selectSquare(row, col);
            }
        }
    } else {
        // Select a piece
        if (square && square.color === currentTurn) {
            selectSquare(row, col);
        }
    }
}

// Select a square
function selectSquare(row, col) {
    selectedSquare = { row, col };
    highlightValidMoves(row, col);
    
    const squares = document.querySelectorAll('.square');
    squares.forEach(sq => {
        if (parseInt(sq.dataset.row) === row && parseInt(sq.dataset.col) === col) {
            sq.classList.add('selected');
        }
    });
}

// Clear selection
function clearSelection() {
    selectedSquare = null;
    const squares = document.querySelectorAll('.square');
    squares.forEach(sq => {
        sq.classList.remove('selected', 'valid-move', 'has-piece');
    });
}

// Highlight valid moves
function highlightValidMoves(row, col) {
    const squares = document.querySelectorAll('.square');
    squares.forEach(sq => {
        const targetRow = parseInt(sq.dataset.row);
        const targetCol = parseInt(sq.dataset.col);
        if (isValidMove(row, col, targetRow, targetCol)) {
            sq.classList.add('valid-move');
            if (board[targetRow][targetCol]) {
                sq.classList.add('has-piece');
            }
        }
    });
}

// Basic move validation (simplified - doesn't check for check/checkmate)
function isValidMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow === toRow && fromCol === toCol) return false;
    
    const piece = board[fromRow][fromCol];
    if (!piece) return false;
    
    const target = board[toRow][toCol];
    if (target && target.color === piece.color) return false;
    
    // Basic movement rules (simplified)
    switch (piece.type) {
        case 'pawn':
            return isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
        case 'rook':
            return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'knight':
            return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'bishop':
            return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'queen':
            return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'king':
            return isValidKingMove(fromRow, fromCol, toRow, toCol);
        default:
            return false;
    }
}

// Pawn movement
function isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Move forward one square
    if (toCol === fromCol && toRow === fromRow + direction && !board[toRow][toCol]) {
        return true;
    }
    
    // Move forward two squares from starting position
    if (toCol === fromCol && fromRow === startRow && toRow === fromRow + (2 * direction) && 
        !board[toRow][toCol] && !board[fromRow + direction][fromCol]) {
        return true;
    }
    
    // Capture diagonally
    if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && board[toRow][toCol]) {
        return true;
    }
    
    return false;
}

// Rook movement
function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    return !isPathBlocked(fromRow, fromCol, toRow, toCol);
}

// Bishop movement
function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
    return !isPathBlocked(fromRow, fromCol, toRow, toCol);
}

// Queen movement (combines rook and bishop)
function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol) || 
           isValidBishopMove(fromRow, fromCol, toRow, toCol);
}

// Knight movement
function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

// King movement
function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return rowDiff <= 1 && colDiff <= 1;
}

// Check if path is blocked
function isPathBlocked(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol]) return true;
        currentRow += rowStep;
        currentCol += colStep;
    }
    
    return false;
}

// Make a move
function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    
    // Handle capture
    if (capturedPiece) {
        capturedPieces[capturedPiece.color].push(capturedPiece.type);
        updateCapturedPieces();
    }
    
    // Move piece
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    // Record move
    const moveNotation = `${piece.type} ${String.fromCharCode(97 + fromCol)}${8 - fromRow} → ${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    moveHistory.push({ player: currentTurn, notation: moveNotation, from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, captured: capturedPiece });
    updateMoveHistory();
}

// Switch turn
function switchTurn() {
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    document.getElementById('turn-display').textContent = `${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)} to move`;
}

// Update captured pieces display
function updateCapturedPieces() {
    document.getElementById('captured-white').innerHTML = capturedPieces.white.map(p => 
        `<span class="captured-piece">${PIECES.white[p]}</span>`
    ).join('');
    
    document.getElementById('captured-black').innerHTML = capturedPieces.black.map(p => 
        `<span class="captured-piece">${PIECES.black[p]}</span>`
    ).join('');
}

// Update move history
function updateMoveHistory() {
    const historyDiv = document.getElementById('move-history');
    historyDiv.innerHTML = moveHistory.map((move, index) => 
        `<div class="move-history-item">
            <span class="move-number">${Math.floor(index / 2) + 1}.</span>
            <span>${move.notation}</span>
        </div>`
    ).join('');
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

// Update display
function updateDisplay() {
    createBoard();
}

// Undo move
function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    
    // Move piece back
    board[lastMove.from.row][lastMove.from.col] = board[lastMove.to.row][lastMove.to.col];
    board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
    
    // Restore captured piece
    if (lastMove.captured) {
        const color = lastMove.captured.color;
        const index = capturedPieces[color].lastIndexOf(lastMove.captured.type);
        if (index > -1) {
            capturedPieces[color].splice(index, 1);
        }
    }
    
    switchTurn();
    updateDisplay();
    updateCapturedPieces();
    updateMoveHistory();
}

// Reset game
function resetGame() {
    initializeBoard();
    selectedSquare = null;
    currentTurn = 'white';
    moveHistory = [];
    capturedPieces = { white: [], black: [] };
    document.getElementById('turn-display').textContent = 'White to move';
    document.getElementById('status-message').textContent = 'Game in progress';
    updateDisplay();
    updateCapturedPieces();
    updateMoveHistory();
}

// Initialize game on load
initializeBoard();
createBoard();
