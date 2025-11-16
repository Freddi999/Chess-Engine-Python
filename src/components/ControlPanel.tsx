import React from 'react';

interface ControlPanelProps {
    depth: number;
    onDepthChange: (depth: number) => void;
    onNewGame: () => void;
    onUndo: () => void;
    onDraw: () => void;
    isThinking: boolean;
    canUndo: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ depth, onDepthChange, onNewGame, onUndo, onDraw, isThinking, canUndo }) => {
    const buttonStyle = "w-full text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-50 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="flex flex-col gap-4 mt-6">
            <div>
                <label htmlFor="depth" className="block text-sm font-medium text-stone-600 mb-2">
                    Difficulty (Depth: {depth})
                </label>
                <input
                    type="range"
                    id="depth"
                    min="1"
                    max="4"
                    step="1"
                    value={depth}
                    onChange={(e) => onDepthChange(parseInt(e.target.value))}
                    disabled={isThinking}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50"
                />
                 <div className="flex justify-between text-xs text-stone-500 px-1 mt-1">
                    <span>Easy</span>
                    <span>Expert</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onNewGame}
                    className={`${buttonStyle} bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500`}
                >
                    New Game
                </button>
                <button
                    onClick={onUndo}
                    disabled={!canUndo || isThinking}
                    className={`${buttonStyle} bg-sky-600 hover:bg-sky-700 focus:ring-sky-500`}
                >
                    Undo Move
                </button>
                <button
                    onClick={onDraw}
                    disabled={isThinking || !canUndo}
                    className={`${buttonStyle} col-span-2 bg-stone-500 hover:bg-stone-600 focus:ring-stone-400`}
                >
                    Offer Draw
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;