import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  clean: true,
  bundle: false,
  sourcemap: true,

  entry: ["src/index.ts"],
  outDir: "dist",

  splitting: false, // No code splitting
  format: ["esm", "cjs"], // Optional: depends on your target usage
  shims: false,
  dts: false, // Set to true if you want to generate .d.ts files
  minify: false,

  async onSuccess() {
    // Create target directory
    const targetDir = path.join("dist", "resources", "employee-sqlite");
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy all SQL files from resources/employee-sqlite to dist/resources/employee-sqlite
    const sourceDir = path.join("resources", "employee-sqlite");
    const files = fs.readdirSync(sourceDir);

    for (const file of files) {
      if (file.endsWith(".sql")) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${sourcePath} to ${targetPath}`);
      }
    }
  },
});
