import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// FIX: Import 'cwd' from 'node:process' to resolve TypeScript error.
import { cwd } from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [react()],
    // IMPORTANT: Update this with your GitHub repository name
    // For example, if your repository URL is https://github.com/user/my-app,
    // set base to '/my-app/'
    base: '/parivartan-miet/',
    define: {
      // This makes the API_KEY available in the client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
