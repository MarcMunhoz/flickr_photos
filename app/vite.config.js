import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

const path = await import("path");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue()],
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    server: {
      port: env.VITE_DEV_PORT,
      allowedHosts: ["localhost", "127.0.0.1", "app", "flickr-gallery_hst"],
      // Browser requests use the same /api path in development and production.
      proxy: {
        "/api": "http://localhost:3000",
      },
      // Polling keeps file watching reliable when the app runs through Docker volumes.
      watch: {
        usePolling: true,
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `
            @sm-screens: ~"(max-width: 768px)";
            @color-flickr-blue: #0462dc;
            @color-flickr-pink: #ff0084;
          `,
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.js"],
      clearMocks: true,
      restoreMocks: true,
    },
  };
});
