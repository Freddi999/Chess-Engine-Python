import React, { useState, useMemo, useEffect } from 'react';
import PieceComponent from './Piece';
import { Piece, Square } from '../types';

interface ChessboardProps {
    fen: string;
    onMove: (from: Square, to: Square) => void;
    isThinking: boolean;
    turn: 'w' | 'b';
    gameOver: boolean;
}

const Chessboard: React.FC<ChessboardProps> = ({ fen, onMove, isThinking, turn, gameOver }) => {
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [validMoves, setValidMoves] = useState<Square[]>([]);

    const board = useMemo(() => {
        if (fen === 'start') {
            return Array(8).fill(null).map(() => Array(8).fill(null));
        }
        const boardState: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
        const [placement, _activeColor, _castling, _enpassant, _halfmove, _fullmove] = fen.split(" ");
        const rows = placement.split('/');

        rows.forEach((row, rowIndex) => {
            let colIndex = 0;
            for (const char of row) {
                if (isNaN(parseInt(char))) {
                    boardState[rowIndex][colIndex] = {
                        type: char.toLowerCase() as Piece['type'],
                        color: char === char.toUpperCase() ? 'w' : 'b'
                    };
                    colIndex++;
                } else {
                    colIndex += parseInt(char);
                }
            }
        });
        return boardState;
    }, [fen]);
    
    // Clear selection if computer is thinking or turn changes
    useEffect(() => {
        if (isThinking || turn === 'b') {
            setSelectedSquare(null);
            setValidMoves([]);
        }
    }, [isThinking, turn]);

    const handleSquareClick = (row: number, col: number) => {
        if (isThinking || gameOver) return;

        const squareName = String.fromCharCode(97 + col) + (8 - row) as Square;
        const piece = board[row][col];

        // Player can only control white pieces
        if (turn !== 'w') return;

        if (selectedSquare) {
            // is it a valid move?
            if (validMoves.includes(squareName)) {
                onMove(selectedSquare, squareName);
                setSelectedSquare(null);
                setValidMoves([]);
            } else {
                // select another piece
                if (piece && piece.color === 'w') {
                    selectPiece(squareName);
                } else {
                    setSelectedSquare(null);
                    setValidMoves([]);
                }
            }
        } else {
            // select a piece
            if (piece && piece.color === 'w') {
                selectPiece(squareName);
            }
        }
    };
    
    const selectPiece = (square: Square) => {
        // We need a new chess.js instance to calculate moves without affecting the main game state
        const game = new (window as any).Chess(fen);
        const moves = game.moves({ square, verbose: true }).map((move: any) => move.to);
        setSelectedSquare(square);
        setValidMoves(moves);
    };

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    return (
        <div className={`aspect-square w-full max-w-lg lg:max-w-xl shadow-2xl relative transition-opacity duration-300 ${gameOver ? 'opacity-70' : ''}`}>
            {isThinking && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20 rounded-md">
                    <div className="text-stone-800 text-2xl font-bold animate-pulse">Computer is thinking...</div>
                </div>
            )}
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full border-4 border-stone-300 rounded-md overflow-hidden">
                {Array.from({ length: 64 }).map((_, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const piece = board[row]?.[col];
                    const isLight = (row + col) % 2 !== 0;
                    const squareName = `${files[col]}${ranks[row]}` as Square;
                    const isSelected = selectedSquare === squareName;
                    const isPossibleMove = validMoves.includes(squareName);

                    return (
                        <div
                            key={i}
                            onClick={() => handleSquareClick(row, col)}
                            className={`
                                ${isLight ? 'bg-stone-200' : 'bg-emerald-700'}
                                relative flex items-center justify-center cursor-pointer group
                                transition-colors duration-200
                                ${isSelected ? 'bg-yellow-400' : ''}
                            `}
                        >
                            {piece && <PieceComponent piece={piece} />}
                            {isPossibleMove && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1/3 h-1/3 rounded-full bg-black bg-opacity-30"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Chessboard;