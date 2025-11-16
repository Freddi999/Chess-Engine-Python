import path from 'path';
import { fileURLToPath } from 'url'; // 1. Import this
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 2. Define __dirname manually for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Your config will now work
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                // This line will no longer have an error
                '@': path.resolve(__dirname, './src'), 
            }
        }
    };
});