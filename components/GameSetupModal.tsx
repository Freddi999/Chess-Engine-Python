import React, { useState } from 'react';

interface GameSetupModalProps {
    onGameStart: (depth: number) => void;
    initialDepth: number;
}

const GameSetupModal: React.FC<GameSetupModalProps> = ({ onGameStart, initialDepth }) => {
    const [depth, setDepth] = useState(initialDepth);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full text-stone-800">
                <h1 className="text-3xl font-bold text-center text-emerald-700 mb-2">Welcome to React Chess</h1>
                <p className="text-center text-stone-500 mb-8">Select difficulty to begin</p>

                <div className="mb-8">
                    <label htmlFor="depth-setup" className="block text-lg font-medium text-stone-700 mb-3 text-center">
                        Computer Difficulty (Depth: {depth})
                    </label>
                    <input
                        type="range"
                        id="depth-setup"
                        min="1"
                        max="4"
                        step="1"
                        value={depth}
                        onChange={(e) => setDepth(parseInt(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                     <div className="flex justify-between text-xs text-stone-500 px-1 mt-2">
                        <span>Easy</span>
                        <span>Medium</span>
                        <span>Hard</span>
                        <span>Expert</span>
                    </div>
                </div>

                <button
                    onClick={() => onGameStart(depth)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-emerald-500"
                >
                    Start Game
                </button>
            </div>
        </div>
    );
};

// FIX: Added default export for GameSetupModal component.
export default GameSetupModal;