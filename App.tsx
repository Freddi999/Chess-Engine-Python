import React, { useState, useEffect, useCallback } from 'react';
import Chessboard from './components/Chessboard';
import ControlPanel from './components/ControlPanel';
import GameSetupModal from './components/GameSetupModal';
import { getBestMove } from './src/services/chessEngineService';
import { Square } from './types';

// The chess.js library is loaded from a CDN in index.html, so we declare it here.
declare const Chess: any;

type GameState = 'setup' | 'playing' | 'ended';

const App: React.FC = () => {
    const [game, setGame] = useState(() => new Chess());
    const [fen, setFen] = useState<string>('start');
    const [history, setHistory] = useState<string[]>([]);
    const [depth, setDepth] = useState<number>(2);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('Welcome!');
    const [gameState, setGameState] = useState<GameState>('setup');

    const updateStatus = useCallback(() => {
        if (gameState !== 'playing') return;
        let moveColor = game.turn() === 'w' ? 'White' : 'Black';
        if (game.in_checkmate()) {
            setStatus(`Checkmate! ${moveColor === 'White' ? 'Black' : 'White'} wins.`);
            setGameState('ended');
        } else if (game.in_draw()) {
            let reason = 'Draw!';
            if (game.in_stalemate()) reason = 'Stalemate!';
            else if (game.in_threefold_repetition()) reason = 'Threefold Repetition!';
            else if (game.insufficient_material()) reason = 'Insufficient Material!';
            else if (game.half_moves >= 100) reason = '50-Move Rule!';
            setStatus(reason);
            setGameState('ended');
        } else {
            setStatus(`${moveColor} to move`);
            if (game.in_check()) {
                setStatus(prev => `${prev} (in check)`);
            }
        }
    }, [game, gameState]);

    useEffect(() => {
        if (gameState === 'playing') {
            updateStatus();
        }
    }, [fen, updateStatus, gameState]);

    const handleMove = (from: Square, to: Square): boolean => {
        if (isThinking || gameState !== 'playing') return false;

        const move = game.move({
            from,
            to,
            promotion: 'q' // Always promote to queen for simplicity
        });

        if (move === null) return false;
        
        setHistory(prev => [...prev, fen]);
        const newFen = game.fen();
        setFen(newFen);
        
        if (!game.game_over()) {
            // Add a small delay to allow the UI to update before computer thinks
            setTimeout(() => {
                triggerComputerMove(newFen);
            }, 100);
        } else {
            updateStatus();
        }
        return true;
    };

    const triggerComputerMove = useCallback(async (currentFen: string) => {
        setIsThinking(true);
        console.log("Computer thinking... FEN:", currentFen);
        console.log("Depth:", depth);
        
        try {
            const bestMove = await getBestMove(currentFen, depth);
            console.log("Best move received:", bestMove);
            
            if (bestMove && !game.game_over()) {
                const from = bestMove.substring(0, 2);
                const to = bestMove.substring(2, 4);
                console.log("Moving from", from, "to", to);
                
                const result = game.move({ from, to, promotion: 'q' });
                console.log("Move result:", result);
                setFen(game.fen());
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsThinking(false);
            updateStatus();
        }
    }, [depth, game, updateStatus]);

    const handleGameStart = (selectedDepth: number) => {
        setDepth(selectedDepth);
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setHistory([]);
        setIsThinking(false);
        setGameState('playing');
    };

    const handleNewGame = useCallback(() => {
        setGameState('setup');
    }, []);

    const handleUndo = useCallback(() => {
        if (isThinking || history.length < 1 || gameState !== 'playing') return;
        
        // This undos both player and computer move
        const previousFen = history[history.length - 1];
        game.load(previousFen);
        setFen(previousFen);
        setHistory(prev => prev.slice(0, -1));
        setGameState('playing');
        updateStatus();
    }, [isThinking, history, game, updateStatus, gameState]);
    
    const handleDraw = useCallback(() => {
        if (gameState === 'playing'){
           setStatus("Game drawn by agreement.");
           setGameState('ended');
        }
    }, [gameState]);

    if (gameState === 'setup') {
        return <GameSetupModal onGameStart={handleGameStart} initialDepth={depth} />;
    }

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
                <div className="relative flex-grow flex items-center justify-center">
                    <Chessboard
                        fen={fen}
                        onMove={handleMove}
                        isThinking={isThinking}
                        turn={game.turn()}
                        gameOver={gameState === 'ended'}
                    />
                </div>
                <div className="lg:w-80 flex-shrink-0 bg-stone-50 rounded-lg shadow-xl p-6 flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-2">React Chess</h1>
                        <p className="text-center text-stone-500 mb-6">Minimax Engine</p>
                        
                        <div className="bg-stone-200 p-4 rounded-lg text-center mb-4">
                            <p className="text-lg font-semibold text-stone-800">{status}</p>
                        </div>
                    </div>
                    
                    <ControlPanel
                        depth={depth}
                        onDepthChange={setDepth}
                        onNewGame={handleNewGame}
                        onUndo={handleUndo}
                        onDraw={handleDraw}
                        isThinking={isThinking}
                        canUndo={history.length >= 1 && gameState === 'playing'}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;