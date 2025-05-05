import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  clean: true,
  bundle: false,
  sourcemap: true,

  entry: ["src/**/*.ts", "src/**/*.json"],
  outDir: "dist",

  splitting: false, // No code splitting
  format: ["esm", "cjs"], // Optional: depends on your target usage
  shims: false,
  dts: false, // Set to true if you want to generate .d.ts files
  minify: false,

  async onSuccess() {


    // Copy .env file to dist directory
    const envFilePath = path.join(".env");
    const envTargetPath = path.join("dist", ".env");
    if (fs.existsSync(envFilePath)) {
      fs.copyFileSync(envFilePath, envTargetPath);
      console.log(`Copied ${envFilePath} to ${envTargetPath}`);
    }
  },
});
