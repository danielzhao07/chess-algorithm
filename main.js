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
let enPassantTarget = null;
let castlingRights = {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
};
let kingPositions = { white: null, black: null };
let isCheck = false;
let isCheckmate = false;
let isStalemate = false;

// Initialize the board with starting positions
function initializeBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Black pieces (top)
    board[0] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(piece => ({ type: piece, color: 'black' }));
    board[1] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' }));
    
    // White pieces (bottom)
    board[6] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' }));
    board[7] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(piece => ({ type: piece, color: 'white' }));
    
    // Track king positions
    kingPositions = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
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
    if (isCheckmate || isStalemate) return;
    
    const square = board[row][col];
    
    if (selectedSquare) {
        // Try to move the piece
        const validMoves = getValidMoves(selectedSquare.row, selectedSquare.col);
        const isValid = validMoves.some(move => move.row === row && move.col === col);
        
        if (isValid) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            clearSelection();
            switchTurn();
            checkGameState();
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
    const validMoves = getValidMoves(row, col);
    
    squares.forEach(sq => {
        const targetRow = parseInt(sq.dataset.row);
        const targetCol = parseInt(sq.dataset.col);
        if (validMoves.some(move => move.row === targetRow && move.col === targetCol)) {
            sq.classList.add('valid-move');
            if (board[targetRow][targetCol]) {
                sq.classList.add('has-piece');
            }
        }
    });
}

// Get valid moves (legal moves that don't leave king in check)
function getValidMoves(row, col) {
    const moves = getPseudoLegalMoves(row, col);
    const piece = board[row][col];
    if (!piece) return [];
    
    return moves.filter(move => {
        // Simulate the move
        const originalBoard = JSON.parse(JSON.stringify(board));
        const originalKingPos = JSON.parse(JSON.stringify(kingPositions));
        
        board[move.row][move.col] = piece;
        board[row][col] = null;
        
        if (piece.type === 'king') {
            kingPositions[piece.color] = { row: move.row, col: move.col };
        }
        
        // Check if this leaves the king in check
        const inCheck = isKingInCheck(piece.color);
        
        // Restore board
        board = originalBoard;
        kingPositions = originalKingPos;
        
        return !inCheck;
    });
}

// Get pseudo-legal moves (moves that follow piece movement rules)
function getPseudoLegalMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    
    switch (piece.type) {
        case 'pawn': return getPawnMoves(row, col, piece.color);
        case 'rook': return getRookMoves(row, col, piece.color);
        case 'knight': return getKnightMoves(row, col, piece.color);
        case 'bishop': return getBishopMoves(row, col, piece.color);
        case 'queen': return getQueenMoves(row, col, piece.color);
        case 'king': return getKingMoves(row, col, piece.color);
        default: return [];
    }
}

// Pawn movement (including en passant)
function getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Move forward one square
    if (isValidSquare(row + direction, col) && !board[row + direction][col]) {
        moves.push({ row: row + direction, col });
        
        // Move forward two squares from starting position
        if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col });
        }
    }
    
    // Capture diagonally
    for (const colOffset of [-1, 1]) {
        const newRow = row + direction;
        const newCol = col + colOffset;
        if (isValidSquare(newRow, newCol)) {
            const targetPiece = board[newRow][newCol];
            if (targetPiece && targetPiece.color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
            
            // En passant
            if (enPassantTarget && 
                newRow === enPassantTarget.row && 
                newCol === enPassantTarget.col) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    
    return moves;
}

// Rook movement
function getRookMoves(row, col, color) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        
        while (isValidSquare(newRow, newCol)) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            newRow += dr;
            newCol += dc;
        }
    }
    
    return moves;
}

// Knight movement
function getKnightMoves(row, col, color) {
    const moves = [];
    const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dr, dc] of offsets) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (isValidSquare(newRow, newCol)) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece || targetPiece.color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    
    return moves;
}

// Bishop movement
function getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    
    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        
        while (isValidSquare(newRow, newCol)) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            newRow += dr;
            newCol += dc;
        }
    }
    
    return moves;
}

// Queen movement (combines rook and bishop)
function getQueenMoves(row, col, color) {
    return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)];
}

// King movement (including castling)
function getKingMoves(row, col, color) {
    const moves = [];
    const offsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    
    for (const [dr, dc] of offsets) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (isValidSquare(newRow, newCol)) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece || targetPiece.color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    
    // Castling
    if (!isKingInCheck(color)) {
        // Kingside castling
        if (castlingRights[color].kingSide) {
            if (!board[row][col + 1] && !board[row][col + 2] &&
                !isSquareAttacked(row, col + 1, color) && !isSquareAttacked(row, col + 2, color)) {
                moves.push({ row, col: col + 2 });
            }
        }
        
        // Queenside castling
        if (castlingRights[color].queenSide) {
            if (!board[row][col - 1] && !board[row][col - 2] && !board[row][col - 3] &&
                !isSquareAttacked(row, col - 1, color) && !isSquareAttacked(row, col - 2, color)) {
                moves.push({ row, col: col - 2 });
            }
        }
    }
    
    return moves;
}

// Check if a square is valid
function isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Check if king is in check
function isKingInCheck(color) {
    const kingPos = kingPositions[color];
    if (!kingPos) return false;
    
    return isSquareAttacked(kingPos.row, kingPos.col, color);
}

// Check if a square is attacked by the opponent
function isSquareAttacked(row, col, defendingColor) {
    const attackingColor = defendingColor === 'white' ? 'black' : 'white';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.color === attackingColor) {
                const moves = getPseudoLegalMoves(r, c);
                if (moves.some(move => move.row === row && move.col === col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check game state for check, checkmate, or stalemate
function checkGameState() {
    const inCheck = isKingInCheck(currentTurn);
    isCheck = inCheck;
    
    const hasLegalMoves = playerHasLegalMoves(currentTurn);
    
    if (!hasLegalMoves) {
        if (inCheck) {
            isCheckmate = true;
        } else {
            isStalemate = true;
        }
    }
    
    updateGameInfo();
}

// Check if player has any legal moves
function playerHasLegalMoves(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === color) {
                const validMoves = getValidMoves(row, col);
                if (validMoves.length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Make a move
function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    
    // Store move for undo
    const move = {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: piece,
        captured: capturedPiece,
        enPassantTarget: enPassantTarget,
        castlingRights: JSON.parse(JSON.stringify(castlingRights))
    };
    
    // Handle en passant capture
    if (piece.type === 'pawn' && enPassantTarget && 
        toRow === enPassantTarget.row && toCol === enPassantTarget.col) {
        const captureRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
        const capturedPawn = board[captureRow][toCol];
        board[captureRow][toCol] = null;
        move.captured = capturedPawn;
        move.enPassant = true;
        if (capturedPawn) {
            capturedPieces[capturedPawn.color].push(capturedPawn.type);
        }
    }
    
    // Handle castling
    if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
        const isKingSide = toCol > fromCol;
        const rookFromCol = isKingSide ? 7 : 0;
        const rookToCol = isKingSide ? toCol - 1 : toCol + 1;
        
        board[toRow][rookToCol] = board[toRow][rookFromCol];
        board[toRow][rookFromCol] = null;
        move.castling = isKingSide ? 'kingside' : 'queenside';
    }
    
    // Handle regular capture
    if (capturedPiece && !move.enPassant) {
        capturedPieces[capturedPiece.color].push(capturedPiece.type);
    }
    
    // Move piece
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    // Update king position
    if (piece.type === 'king') {
        kingPositions[piece.color] = { row: toRow, col: toCol };
    }
    
    // Handle pawn promotion
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
        board[toRow][toCol] = { type: 'queen', color: piece.color };
        move.promotion = true;
    }
    
    // Update castling rights
    updateCastlingRights(piece, fromRow, fromCol);
    
    // Set en passant target
    enPassantTarget = null;
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
        enPassantTarget = {
            row: piece.color === 'white' ? fromRow - 1 : fromRow + 1,
            col: fromCol
        };
    }
    
    // Record move
    const moveNotation = formatMoveNotation(move);
    moveHistory.push(move);
    
    updateCapturedPieces();
    updateMoveHistory();
}

// Update castling rights
function updateCastlingRights(piece, row, col) {
    const color = piece.color;
    
    if (piece.type === 'king') {
        castlingRights[color].kingSide = false;
        castlingRights[color].queenSide = false;
    } else if (piece.type === 'rook') {
        if (color === 'white' && row === 7) {
            if (col === 0) castlingRights.white.queenSide = false;
            if (col === 7) castlingRights.white.kingSide = false;
        } else if (color === 'black' && row === 0) {
            if (col === 0) castlingRights.black.queenSide = false;
            if (col === 7) castlingRights.black.kingSide = false;
        }
    }
}

// Format move notation
function formatMoveNotation(move) {
    if (move.castling) {
        return move.castling === 'kingside' ? 'O-O' : 'O-O-O';
    }
    
    const piece = move.piece.type;
    const from = String.fromCharCode(97 + move.from.col) + (8 - move.from.row);
    const to = String.fromCharCode(97 + move.to.col) + (8 - move.to.row);
    const capture = move.captured ? 'x' : '-';
    const pieceSymbol = piece === 'pawn' ? '' : piece.charAt(0).toUpperCase();
    
    return `${pieceSymbol}${from}${capture}${to}`;
}

// Switch turn
function switchTurn() {
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    document.getElementById('current-turn').textContent = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1);
}

// Update game info
function updateGameInfo() {
    const statusElement = document.getElementById('status-message');
    
    if (isCheckmate) {
        const winner = currentTurn === 'white' ? 'Black' : 'White';
        statusElement.textContent = `Checkmate! ${winner} wins!`;
        statusElement.className = 'status-message check';
    } else if (isStalemate) {
        statusElement.textContent = 'Stalemate! Game is a draw.';
        statusElement.className = 'status-message';
    } else if (isCheck) {
        statusElement.textContent = 'Check!';
        statusElement.className = 'status-message check';
    } else {
        statusElement.textContent = 'Make your move';
        statusElement.className = 'status-message';
    }
}

// Update captured pieces display
function updateCapturedPieces() {
    document.getElementById('white-captured').innerHTML = capturedPieces.white.map(p => 
        `<span class="captured-piece">${PIECES.white[p]}</span>`
    ).join('');
    
    document.getElementById('black-captured').innerHTML = capturedPieces.black.map(p => 
        `<span class="captured-piece">${PIECES.black[p]}</span>`
    ).join('');
}

// Update move history
function updateMoveHistory() {
    const historyDiv = document.getElementById('move-history');
    historyDiv.innerHTML = '';
    
    for (let i = 0; i < moveHistory.length; i += 2) {
        const whiteMove = moveHistory[i];
        const blackMove = moveHistory[i + 1];
        
        const moveItem = document.createElement('div');
        moveItem.className = 'move-history-item';
        
        const moveNumber = document.createElement('span');
        moveNumber.className = 'move-number';
        moveNumber.textContent = `${Math.floor(i / 2) + 1}.`;
        
        const whiteMoveText = document.createElement('span');
        whiteMoveText.textContent = formatMoveNotation(whiteMove);
        
        moveItem.appendChild(moveNumber);
        moveItem.appendChild(whiteMoveText);
        
        if (blackMove) {
            const blackMoveText = document.createElement('span');
            blackMoveText.textContent = formatMoveNotation(blackMove);
            moveItem.appendChild(blackMoveText);
        }
        
        historyDiv.appendChild(moveItem);
    }
    
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

// Update display
function updateDisplay() {
    createBoard();
    updateCapturedPieces();
    updateMoveHistory();
    updateGameInfo();
}

// Undo move
function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    
    // Restore piece positions
    board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    board[lastMove.to.row][lastMove.to.col] = lastMove.captured || null;
    
    // Restore en passant capture
    if (lastMove.enPassant) {
        const color = lastMove.piece.color;
        const captureRow = color === 'white' ? lastMove.to.row + 1 : lastMove.to.row - 1;
        board[captureRow][lastMove.to.col] = lastMove.captured;
        board[lastMove.to.row][lastMove.to.col] = null;
    }
    
    // Restore castling
    if (lastMove.castling) {
        const isKingSide = lastMove.castling === 'kingside';
        const rookFromCol = isKingSide ? lastMove.to.col - 1 : lastMove.to.col + 1;
        const rookToCol = isKingSide ? 7 : 0;
        
        board[lastMove.to.row][rookToCol] = board[lastMove.to.row][rookFromCol];
        board[lastMove.to.row][rookFromCol] = null;
    }
    
    // Restore pawn promotion
    if (lastMove.promotion) {
        board[lastMove.from.row][lastMove.from.col] = { type: 'pawn', color: lastMove.piece.color };
    }
    
    // Restore king position
    if (lastMove.piece.type === 'king') {
        kingPositions[lastMove.piece.color] = lastMove.from;
    }
    
    // Restore game state
    enPassantTarget = lastMove.enPassantTarget;
    castlingRights = lastMove.castlingRights;
    
    // Restore captured pieces
    if (lastMove.captured) {
        const capturedColor = lastMove.captured.color;
        const index = capturedPieces[capturedColor].lastIndexOf(lastMove.captured.type);
        if (index > -1) {
            capturedPieces[capturedColor].splice(index, 1);
        }
    }
    
    // Switch turns back
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    document.getElementById('current-turn').textContent = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1);
    
    // Reset game state flags
    isCheck = false;
    isCheckmate = false;
    isStalemate = false;
    
    updateDisplay();
}

// Reset game
function resetGame() {
    initializeBoard();
    selectedSquare = null;
    currentTurn = 'white';
    moveHistory = [];
    capturedPieces = { white: [], black: [] };
    enPassantTarget = null;
    castlingRights = {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
    };
    isCheck = false;
    isCheckmate = false;
    isStalemate = false;
    
    document.getElementById('current-turn').textContent = 'White';
    updateDisplay();
}

// Event listeners
document.getElementById('new-game-btn').addEventListener('click', resetGame);
document.getElementById('undo-btn').addEventListener('click', undoMove);

// Initialize game on load
initializeBoard();
createBoard();
updateGameInfo();

// ============================================
// AI INTEGRATION PLACEHOLDER
// ============================================
// To integrate your chess AI, implement the following function:
//
// function makeAIMove() {
//     // 1. Get all legal moves for the current player (black/AI)
//     const allMoves = [];
//     for (let row = 0; row < 8; row++) {
//         for (let col = 0; col < 8; col++) {
//             const piece = board[row][col];
//             if (piece && piece.color === currentTurn) {
//                 const moves = getValidMoves(row, col);
//                 moves.forEach(move => {
//                     allMoves.push({ from: { row, col }, to: move });
//                 });
//             }
//         }
//     }
//     
//     // 2. Evaluate positions using your chess engine
//     // 3. Select the best move
//     // 4. Execute: makeMove(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col)
// }
//
// Then call makeAIMove() after each player move when it's the AI's turn
// ============================================
