import React from 'react';

interface AdvantageBarProps {
    advantage: number;
}

const AdvantageBar: React.FC<AdvantageBarProps> = ({ advantage }) => {
    // Clamp advantage for visualization, e.g., max advantage of 10
    const maxAdvantage = 10;
    const clampedAdvantage = Math.max(-maxAdvantage, Math.min(maxAdvantage, advantage));

    // Calculate percentage for white's advantage. 50% is neutral.
    const whitePercentage = 50 + (clampedAdvantage / maxAdvantage) * 50;

    const advantageText = advantage > 0 ? `+${advantage.toFixed(1)}` : advantage.toFixed(1);

    return (
        <div className="my-4">
            <div className="flex justify-between items-center text-sm text-stone-600 font-medium mb-1">
                <span>Advantage</span>
                <span className={`px-2 py-0.5 rounded text-white ${advantage === 0 ? 'bg-stone-500' : advantage > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                    {advantageText}
                </span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden flex">
                <div
                    className="bg-white h-full transition-all duration-500 ease-out"
                    style={{ width: `${whitePercentage}%` }}
                ></div>
                <div
                    className="bg-stone-800 h-full"
                    style={{ width: `${100 - whitePercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default AdvantageBar;