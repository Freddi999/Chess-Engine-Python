from http.server import BaseHTTPRequestHandler
import json
import chess

# Piece values for evaluation
PIECE_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 20000
}

# Piece-square tables for positional evaluation
PAWN_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
]

KNIGHT_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
]

BISHOP_TABLE = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
]

ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
]

QUEEN_TABLE = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
]

KING_TABLE = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
]

PIECE_SQUARE_TABLES = {
    chess.PAWN: PAWN_TABLE,
    chess.KNIGHT: KNIGHT_TABLE,
    chess.BISHOP: BISHOP_TABLE,
    chess.ROOK: ROOK_TABLE,
    chess.QUEEN: QUEEN_TABLE,
    chess.KING: KING_TABLE
}

def get_piece_square_value(piece_type, square, is_white):
    """Get positional value for a piece on a square"""
    table = PIECE_SQUARE_TABLES.get(piece_type)
    if not table:
        return 0
    
    index = square
    # Flip index for black pieces
    if not is_white:
        index = 63 - index
    
    return table[index]

def evaluate_board(board):
    """Evaluate the board position"""
    if board.is_checkmate():
        return -20000 if board.turn else 20000
    
    if board.is_stalemate() or board.is_insufficient_material() or board.can_claim_threefold_repetition():
        return 0
    
    evaluation = 0
    
    # Evaluate all pieces
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece:
            is_white = piece.color == chess.WHITE
            
            # Material value
            value = PIECE_VALUES[piece.piece_type]
            
            # Positional value
            value += get_piece_square_value(piece.piece_type, square, is_white)
            
            # Add or subtract based on color
            evaluation += value if is_white else -value
    
    # Mobility bonus
    mobility = len(list(board.legal_moves))
    evaluation += mobility * 10 if board.turn == chess.WHITE else -mobility * 10
    
    return evaluation

def minimax(board, depth, alpha, beta, maximizing_player):
    """Minimax algorithm with alpha-beta pruning"""
    if depth == 0 or board.is_game_over():
        return evaluate_board(board)
    
    if maximizing_player:
        max_eval = float('-inf')
        for move in board.legal_moves:
            board.push(move)
            evaluation = minimax(board, depth - 1, alpha, beta, False)
            board.pop()
            
            max_eval = max(max_eval, evaluation)
            alpha = max(alpha, evaluation)
            
            if beta <= alpha:
                break  # Beta cutoff
        
        return max_eval
    else:
        min_eval = float('inf')
        for move in board.legal_moves:
            board.push(move)
            evaluation = minimax(board, depth - 1, alpha, beta, True)
            board.pop()
            
            min_eval = min(min_eval, evaluation)
            beta = min(beta, evaluation)
            
            if beta <= alpha:
                break  # Alpha cutoff
        
        return min_eval

def get_best_move(fen, depth):
    """Find the best move for the current position"""
    try:
        board = chess.Board(fen)
        
        if board.is_game_over():
            return None
        
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return None
        
        # Shuffle moves for variety when evaluations are equal
        import random
        random.shuffle(legal_moves)
        
        best_move = legal_moves[0]
        best_value = float('-inf') if board.turn == chess.WHITE else float('inf')
        
        for move in legal_moves:
            board.push(move)
            
            evaluation = minimax(
                board,
                depth - 1,
                float('-inf'),
                float('inf'),
                board.turn == chess.WHITE
            )
            
            board.pop()
            
            # Update best move based on whose turn it is
            if board.turn == chess.WHITE:
                if evaluation > best_value:
                    best_value = evaluation
                    best_move = move
            else:
                if evaluation < best_value:
                    best_value = evaluation
                    best_move = move
        
        # Return move in UCI format
        return best_move.uci()
    
    except Exception as e:
        print(f"Error: {e}")
        return None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            fen = data.get('fen')
            depth = data.get('depth', 2)
            
            if not fen:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'FEN is required'}).encode())
                return
            
            # Get best move
            best_move = get_best_move(fen, depth)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'move': best_move}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()