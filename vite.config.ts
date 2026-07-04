import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
        proxy: {
            '/api': {
               target: 'https://trispermous-hamfistedly-douglas.ngrok-free.dev',
                changeOrigin: true,
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
            },
            '/media': {
               target: 'https://trispermous-hamfistedly-douglas.ngrok-free.dev',
                changeOrigin: true,
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
            },
        }
    },
    plugins: [
        react(),
        mode === 'development' &&
        componentTagger(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
