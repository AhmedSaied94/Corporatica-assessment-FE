import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import process from "node:process";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
    commonjsOptions: { transformMixedEsModules: true }
  },
  server: {
    port: 3000
  },
  define: {
    process
  },

  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx"
      }
    }
  }
});
