const ArcGISPlugin = require("@arcgis/webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //Only works with webpack 4

const path = require("path");
const webpack = require("webpack");

module.exports = function(_, arg) {
  const config = {
    entry: {
      index: ["./src/css/main.scss", "./src/index.js"]
    },
    output: {
      filename: "[name].[chunkhash].bundle.js",
      publicPath: ""
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.js?$/,
          loader: "babel-loader"
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
              options: { minimize: false }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.(jpe?g|png|gif|svg|webp)$/,
          loader: "url-loader",
          options: {
            // Inline files smaller than 10 kB (10240 bytes)
            limit: 10 * 1024
          }
        },
        {
          test: /\.(wsv|ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "build/[name].[ext]"
              }
            }
          ]
        },
        {
          test: /\.css$|\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "resolve-url-loader",
              options: { includeRoot: true }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
                includePaths: [path.resolve("./node_modules")]
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new ArcGISPlugin(),

      new HtmlWebPackPlugin({
        template: "./public/index.html",
        filename: "./index.html",
        favicon: "./public/assets/favicon.ico",
        chunksSortMode: "none",
        inlineSource: ".(css)$",
        mode: arg.mode
      }),

      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      })
    ],
    resolve: {
      //to looking for the files basically inside these folders
      modules: [path.resolve(__dirname, "/src"), "node_modules/"],
      extensions: [".js", ".scss"]
    },
    externals: [
      //Webpack doesn't try to load Web Assembly Files usede by the Objext Engine
      (context, request, callback) => {
        if (/pe-wasm$/.test(request)) {
          return callback(null, "amd " + request);
        }
        callback();
      }
    ],
    node: {
      //Webpack does Not include the node processo and nod Global in the Build, becaus they break the build
      process: false,
      global: false
    }
  };

  return config;
};
