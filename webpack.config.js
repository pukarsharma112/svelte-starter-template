const { resolve } = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const sveltePreprocess = require("svelte-preprocess");
const TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

const config = {
  entry: "./src/main.ts",
  output: {
    path: resolve(__dirname, "__dist__"),
    publicPath: "/",
    filename: isProd ? "[name].[chunkhash:5].js" : "[name].js",
    chunkFilename: "[name].chunk.[chunkhash:5].js"
  },
  resolve: {
    alias: {
      svelte: resolve("node_modules", "svelte")
    },
    extensions: [".mjs", ".js", ".ts", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
    plugins: [new TsConfigPathsPlugin()]
  },
  optimization: {
    runtimeChunk: "single",
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: [
            "advanced",
            {
              cssDeclarationSorter: true,
              discardComments: { removeAll: true }
            }
          ]
        }
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        exclude: /node_modules/,
        loader: "ts-loader"
      },
      {
        test: /\.svelte$/,
        loader: "svelte-loader-hot",
        options: {
          dev: !isProd,
          emitCss: isProd,
          hotReload: !isProd,
          hotOptions: {
            noPreserveState: false,
            optimistic: true
          },
          preprocess: sveltePreprocess({
            scss: true,
            postcss: true
          })
        }
      },
      {
        test: /\.css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "postcss-loader"
        ]
      },
      {
        test: /\.s[ac]ss$/,
        enforce: "pre",
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(svg|woff2?|ttf|eot|jpe?g|png|webp|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
        loader: "file-loader"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
      hash: isProd
    }),
    new MiniCssExtractPlugin({
      filename: isProd ? "[name].[contenthash:5].css" : "[name].css",
      chunkFilename: isProd
        ? "[name].chunk.[contenthash:5].css"
        : "[name].chunk.css"
    })
  ],
  mode: isProd ? "production" : "development",
  devtool: isProd ? false : "source-map",
  stats: "errors-only",
  devServer: {
    contentBase: "./assets",
    host: "0.0.0.0",
    port: 3000,
    quiet: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
    watchContentBase: false
  }
};

if (isProd) {
  config.plugins.push(
    new webpack.HashedModuleIdsPlugin(),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./assets",
          noErrorOnMissing: true
        }
      ]
    })
  );
}

module.exports = config;
