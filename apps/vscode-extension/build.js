//@ts-check
"use strict";

const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/**
 * Copy dashboard files from monorepo to extension directory
 */
async function copyDashboard() {
  const sourcePath = path.resolve(__dirname, "../dashboard/dist");
  const destPath = path.resolve(__dirname, "_dashboard");

  console.log("[dashboard] Copying dashboard files...");

  if (!fs.existsSync(sourcePath)) {
    console.error(`✘ [ERROR] Dashboard dist not found at: ${sourcePath}`);
    console.error("Make sure to build the dashboard first!");
    console.error("Run: cd ../../dashboard && npm run build");
    process.exit(1);
  }

  try {
    // Remove existing dashboard folder
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }

    // Copy dashboard files
    fs.cpSync(sourcePath, destPath, {
      recursive: true,
      // do not include the rollup-plugin-visualizer file: deps.html
      filter: (src) => {
        const baseName = path.basename(src);
        return baseName !== "deps.html";
      },
    });

    // Get folder size for logging
    /**
     * @type {(dir: string) => number}
     */
    const getDirSize = (dir) => {
      let size = 0;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += getDirSize(filePath);
        } else {
          size += stats.size;
        }
      }
      return size;
    };

    const dashboardSize = getDirSize(destPath);
    const dashboardSizeKB = (dashboardSize / 1024).toFixed(1);

    console.log(
      `[dashboard] Dashboard files copied successfully ✓ (${dashboardSizeKB} KB)`,
    );
  } catch (error) {
    console.error(`✘ [ERROR] Failed to copy dashboard files:`, error.message);
    process.exit(1);
  }
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",
  setup(build) {
    /**
     * @type {number}
     */
    let startTime;

    build.onStart(() => {
      startTime = Date.now();
      console.log("[watch] build started");
    });
    build.onEnd((result) => {
      const duration = Date.now() - startTime;

      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location) {
          console.error(
            `    ${location.file}:${location.line}:${location.column}:`,
          );
        }
      });

      if (result.errors.length === 0) {
        try {
          const stats = fs.statSync("dist/extension.js");
          const fileSizeInKB = (stats.size / 1024).toFixed(1);
          console.log(
            `[watch] build finished in ${duration}ms ✓ (${fileSizeInKB} KB)`,
          );
        } catch {
          console.log(`[watch] build finished in ${duration}ms ✓`);
        }
      } else {
        console.log(
          `[watch] build finished in ${duration}ms with ${result.errors.length} error(s)`,
        );
      }
    });
  },
};

/**
 * @type {import('esbuild').Plugin}
 */
const aliasPlugin = {
  name: "alias",
  setup(build) {
    build.onResolve({ filter: /^@repo\/utils$/ }, () => ({
      path: path.resolve(__dirname, "../../packages/common/src/index.ts"),
    }));
    build.onResolve({ filter: /^@repo\/trpc$/ }, () => ({
      path: path.resolve(__dirname, "../../packages/trpc/src/index.ts"),
    }));
  },
};

async function main() {
  // Always copy dashboard files, even in watch mode
  await copyDashboard();

  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],

    bundle: true,

    format: "cjs",

    platform: "node",

    outfile: "dist/extension.js",

    minify: production,
    sourcemap: production ? false : true,
    sourcesContent: false,

    external: ["vscode"],

    resolveExtensions: [".ts", ".js", ".cjs"],

    plugins: [esbuildProblemMatcherPlugin, aliasPlugin],

    tsconfig: path.resolve(__dirname, "./tsconfig.json"),

    logLevel: "info",

    target: "node16",
  });

  if (watch) {
    console.log("Watching for changes...");
    await ctx.watch();
  } else {
    const startTime = Date.now();
    await ctx.rebuild();
    const duration = Date.now() - startTime;
    console.log(`Build completed in ${duration}ms ✓`);
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
