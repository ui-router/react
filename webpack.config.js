const path = require("path");
const webpack = require("webpack");

const isdev = (process.env.NODE_ENV || 'development') === 'development';
const config = {
  mode: isdev ? 'development' : 'production',
  watch:  process.env.WATCH === 'true',
  devtool: 'source-map',
  entry: {
    "ui-router-react": ["./src/index.ts"],
    "ui-router-react.min": ["./src/index.ts"]
  },
  output: {
    path: path.resolve(__dirname, "_bundles"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "UIRouterReact",
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /(node_modules|__tests__)/
      }
    ]
  },
  externals: {
    "react": { root: 'React', amd: 'react', commonjs2: 'react', commonjs: 'react' }
  }
};

module.exports = config;
