export const getBestMove = async (fen: string, depth: number): Promise<string | null> => {
    try {
        const response = await fetch('/api/chess-engine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fen, depth }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.move;

    } catch (error) {
        console.error('Failed to get best move from API:', error);
        return null;
    }
};