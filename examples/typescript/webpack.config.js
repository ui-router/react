var path = require('path');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

var configFilePath = path.resolve(__dirname, 'tsconfig.json');

var config = {
  entry: [path.resolve(__dirname, './index.tsx')],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsConfigPathsPlugin({ configFileName: configFilePath })],
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /(node_modules|__tests__)/,
      },
    ],
  },
};

module.exports = config;
