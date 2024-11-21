import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
const path = require("path");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue()],
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
    server: {
      port: env.VITE_DEV_PORT,
      watch: {
        usePolling: true
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `
            @sm-screens: ~"(max-width: 768px)";
            @color-flickr-blue: #0462dc;
            @color-flickr-pink: #ff0084;
          `
        }
      }
    }
  };
});
