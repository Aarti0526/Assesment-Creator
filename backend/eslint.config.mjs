import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
   globalIgnores(["dist", "node_modules"]),
   {
      files: ["**/*.ts"],
      extends: [js.configs.recommended, tseslint.configs.recommended],
      languageOptions: {
         ecmaVersion: 2020,
         globals: globals.node,
         parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: import.meta.dirname,
         },
      },
      rules: {
         "@typescript-eslint/consistent-type-imports": "error",
         "@typescript-eslint/no-import-type-side-effects": "error",
      },
   },
   {
      plugins: {
         "simple-import-sort": simpleImportSort,
      },
      rules: {
         "simple-import-sort/imports": "error",
         "simple-import-sort/exports": "error",
      },
   },
   prettier,
]);
