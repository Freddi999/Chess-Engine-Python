export const getBestMove = async (fen: string, depth: number): Promise<string | null> => {
    try {
        const url = process.env.NODE_ENV === 'development'
            ? 'http://localhost:5000/api/chess-engine' // local test server
            : '/api/chess-engine'; // Vercel will serve at same origin

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen, depth }),
        });

        if (!response.ok) {
            console.error(`API error: ${response.status}`);
            return null;
        }
        const data = await response.json();
        return data.move ?? null;
    } catch (err) {
        console.error('Failed to get best move from API:', err);
        return null;
    }
};