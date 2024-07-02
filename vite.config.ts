import copy from "rollup-plugin-copy";
import { defineConfig } from "vite";


export default defineConfig({
    esbuild: {
        minifyIdentifiers: false, // Turning this on will cause mangling with Foundry
    },
    build: {
        outDir: "./dist",
        sourcemap: true,
        rollupOptions: {
            input: {
                control: "./module/control.js"
            },
            output: {
                entryFileNames: 'module/entry-[name].js',
                format: "es",
            },
        },
    },
    plugins: [
        copy({
            targets: [
                { src: "./module.json", dest: "dist" },
                { src: "./styles", dest: "dist" },
                { src: "./lang", dest: "dist" },
                { src: "./templates", dest: "dist" },
            ],
            hook: "writeBundle",
        }),
    ],
    test: {
        // Vitest configuration options
        include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        globals: true,
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
        },
      },
});