var path = require("path");
var webpack = require("webpack");

var config = {
	entry: {
		"ui-router-react": ["./_src/index.ts"],
		"ui-router-react.min": ["./_src/index.ts"]
	},
	output: {
		path: path.resolve(__dirname, "_bundles"),
		filename: "[name].js",
		libraryTarget: "umd",
		library: "ui-router-react",
		umdNamedDefine: true
	},
	resolve: {
		extensions: ["", ".ts", ".tsx", ".js"]
	},
	devtool: 'inline-source-map',
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			include: /\.min\.js$/,
		})
	],
	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/
			}
		]
	},
	ts: {
		configFileName: 'tsconfig.webpack.json'
	},
	externals: {
		"react": { root: 'react', amd: 'react', commonjs2: 'react', commonjs: 'react' }
	}
};

module.exports = config;