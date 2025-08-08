/**
 * Webpack Configuration for MusicalConductor E2E Test Bundle
 *
 * This configuration creates an optimized bundle of all MusicalConductor modules
 * to dramatically improve E2E test performance by reducing HTTP requests from
 * 30+ per test to just 1-2 requests.
 *
 * Performance Impact:
 * - Before: 168 tests × 30+ modules = 5,000+ HTTP requests
 * - After: 168 tests × 1-2 bundles = 200-400 HTTP requests
 * - Expected improvement: 95% fewer requests, 80% faster execution
 */

const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development", // Use development for better debugging in E2E tests

  entry: {
    // Main MusicalConductor bundle
    "musical-conductor": "./test-app/dist/modules/communication/index.js",
  },

  output: {
    path: path.resolve(__dirname, "test-app/bundles"),
    filename: "[name].bundle.js",
    library: {
      name: "[name]",
      type: "umd",
      export: "default",
    },
    globalObject: "this",
    clean: true, // Clean output directory before each build
  },

  resolve: {
    extensions: [".js", ".ts", ".json"],
    alias: {
      // Create aliases for common modules to avoid duplication
      "@musical-conductor": path.resolve(
        __dirname,
        "test-app/dist/modules/communication"
      ),
      "@plugins": path.resolve(__dirname, "test-app/plugins"),
    },
    fallback: {
      process: require.resolve("process/browser"),
      buffer: require.resolve("buffer"),
      path: false,
      fs: false,
      os: false,
      crypto: false,
      stream: false,
      util: false,
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["last 2 Chrome versions"],
                  },
                  modules: false, // Keep ES modules for tree shaking
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.json$/,
        type: "json",
      },
    ],
  },

  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // Core MusicalConductor modules
        core: {
          name: "musical-conductor-core",
          test: /[\\/]dist[\\/]modules[\\/]communication[\\/]/,
          priority: 20,
          reuseExistingChunk: true,
        },

        // Plugin modules
        plugins: {
          name: "musical-conductor-plugins",
          test: /[\\/]plugins[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
        },

        // Vendor modules (if any)
        vendor: {
          name: "vendor",
          test: /[\\/]node_modules[\\/]/,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },

    // Enable tree shaking to remove unused code
    usedExports: true,
    sideEffects: false,
  },

  plugins: [
    // Define environment variables
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
      "process.env.E2E_TESTING": JSON.stringify("true"),
    }),

    // Provide global variables for compatibility
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],

  // Development server configuration for testing
  devServer: {
    static: {
      directory: path.join(__dirname, "test-app"),
    },
    port: 3001,
    hot: true,
    open: false,
  },

  // Source maps for debugging
  devtool: "source-map",

  // Performance hints
  performance: {
    hints: "warning",
    maxEntrypointSize: 512000, // 500kb
    maxAssetSize: 512000,
  },

  // Cache configuration for faster rebuilds
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },

  // Stats configuration for cleaner output
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  },
};
