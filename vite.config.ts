import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

/**
 * Custom plugin to create .pro-build marker file for Pro builds
 * This marker is detected by PHP to configure Freemius with is_premium=true
 */
const proBuildMarker = () => ({
  name: 'pro-build-marker',
  closeBundle() {
    const isPro = process.env.VITE_BUILD_VARIANT === 'pro';
    const markerPath = path.resolve(__dirname, 'dist/.pro-build');
    const phpPath = path.resolve(__dirname, 'videosow.php');
    
    if (isPro) {
      fs.writeFileSync(markerPath, 'pro');
      console.log('✓ Created .pro-build marker for Pro version');
      if (fs.existsSync(phpPath)) {
        let phpContent = fs.readFileSync(phpPath, 'utf8');
        phpContent = phpContent.replace(/Plugin Name:\s*Video Sow\s*$/m, 'Plugin Name: Video Sow Pro');
        fs.writeFileSync(phpPath, phpContent, 'utf8');
        console.log('✓ Updated plugin header to "Video Sow Pro"');
      }
    } else {
      if (fs.existsSync(markerPath)) fs.unlinkSync(markerPath);
      if (fs.existsSync(phpPath)) {
        let phpContent = fs.readFileSync(phpPath, 'utf8');
        phpContent = phpContent.replace(/Plugin Name:\s*Video Sow Pro\s*$/m, 'Plugin Name: Video Sow');
        fs.writeFileSync(phpPath, phpContent, 'utf8');
      }
      console.log('✓ Free version build (no .pro-build marker)');
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/wp-content/plugins/videosow/dist/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'production' && proBuildMarker(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Use predictable filenames for WordPress integration
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/index.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    },
    // Copy public files to dist, but hidden files will be excluded by WordPress plugin check
    copyPublicDir: false
  }
}));
