import copy from "rollup-plugin-copy";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        outDir: "./dist",
        sourcemap: false,
        rollupOptions: {
            input: {
                control: "./module/control.js"
            },
            output: {
                sourcemap: true,
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
});