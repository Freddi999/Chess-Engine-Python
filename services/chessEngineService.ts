// Get Chess from window
const Chess = (window as any).Chess;

// Piece values for evaluation
const PIECE_VALUES: { [key: string]: number } = {
    p: 100,   // pawn
    n: 320,   // knight
    b: 330,   // bishop
    r: 500,   // rook
    q: 900,   // queen
    k: 20000  // king
};

// Piece-square tables for positional evaluation
const PAWN_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
];

const PIECE_SQUARE_TABLES: { [key: string]: number[] } = {
    p: PAWN_TABLE,
    n: KNIGHT_TABLE,
    b: BISHOP_TABLE,
    r: ROOK_TABLE,
    q: QUEEN_TABLE,
    k: KING_TABLE
};

/**
 * Get the piece-square table value for a piece at a given square
 */
function getPieceSquareValue(piece: string, square: string, isWhite: boolean): number {
    const pieceType = piece.toLowerCase();
    const table = PIECE_SQUARE_TABLES[pieceType];
    
    if (!table) return 0;
    
    // Convert square notation (e.g., "e4") to index (0-63)
    const file = square.charCodeAt(0) - 97; // a=0, b=1, ..., h=7
    const rank = parseInt(square[1]) - 1;    // 1=0, 2=1, ..., 8=7
    
    let index = (7 - rank) * 8 + file;
    
    // Flip the board for black pieces
    if (!isWhite) {
        index = 63 - index;
    }
    
    return table[index] || 0;
}

/**
 * Evaluate the current board position
 * Positive scores favor white, negative scores favor black
 */
function evaluateBoard(game: any): number {
    // Check game over conditions - use snake_case methods
    if (game.in_checkmate()) {
        return game.turn() === 'w' ? -20000 : 20000;
    }
    
    if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
        return 0;
    }
    
    let evaluation = 0;
    const board = game.board();
    
    // Evaluate all pieces
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            
            if (piece) {
                const isWhite = piece.color === 'w';
                const pieceType = piece.type;
                
                // Material value
                let value = PIECE_VALUES[pieceType] || 0;
                
                // Positional value
                const square = String.fromCharCode(97 + col) + (8 - row);
                value += getPieceSquareValue(pieceType, square, isWhite);
                
                // Add or subtract based on color
                evaluation += isWhite ? value : -value;
            }
        }
    }
    
    // Mobility bonus (number of legal moves)
    const mobility = game.moves().length;
    evaluation += game.turn() === 'w' ? mobility * 10 : -mobility * 10;
    
    return evaluation;
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(
    game: any,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean
): number {
    // Base case: depth is 0 or game is over - use snake_case method
    if (depth === 0 || game.game_over()) {
        return evaluateBoard(game);
    }
    
    const moves = game.moves();
    
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        
        for (const move of moves) {
            game.move(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            
            if (beta <= alpha) {
                break; // Beta cutoff
            }
        }
        
        return maxEval;
    } else {
        let minEval = Infinity;
        
        for (const move of moves) {
            game.move(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            
            if (beta <= alpha) {
                break; // Alpha cutoff
            }
        }
        
        return minEval;
    }
}

/**
 * Get the best move for the current position using minimax with alpha-beta pruning
 */
export const getBestMove = async (fen: string, depth: number): Promise<string | null> => {
    try {
        const game = new Chess(fen);
        
        // Check if game is already over - use snake_case method
        if (game.game_over()) {
            return null;
        }
        
        const moves = game.moves({ verbose: true });
        
        if (moves.length === 0) {
            return null;
        }
        
        // Shuffle moves for variety when evaluations are equal
        const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);
        
        let bestMove = shuffledMoves[0];
        let bestValue = game.turn() === 'w' ? -Infinity : Infinity;
        
        for (const move of shuffledMoves) {
            game.move(move);
            
            const evaluation = minimax(
                game,
                depth - 1,
                -Infinity,
                Infinity,
                game.turn() === 'w'
            );
            
            game.undo();
            
            // Update best move based on whose turn it is
            if (game.turn() === 'w') {
                if (evaluation > bestValue) {
                    bestValue = evaluation;
                    bestMove = move;
                }
            } else {
                if (evaluation < bestValue) {
                    bestValue = evaluation;
                    bestMove = move;
                }
            }
        }
        
        // Return move in UCI format (from + to)
        return bestMove.from + bestMove.to;
        
    } catch (error) {
        console.error('Failed to calculate best move:', error);
        return null;
    }
};