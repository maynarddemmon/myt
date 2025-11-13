import js from "@eslint/js";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: {
        global: "readonly", 
        console: "readonly",
        exports: "readonly",
      }
    } 
  },
]);
