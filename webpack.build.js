var path = require("path");
var webpack = require("webpack");

var config = {
	entry: {
		"ui-router-react": ["./src/index.ts"],
		"ui-router-react.min": ["./src/index.ts"]
	},
	output: {
		path: path.resolve(__dirname, "lib"),
		filename: "[name].js",
		libraryTarget: "umd",
		library: "ui-router-react",
		umdNamedDefine: true
	},
	resolve: {
		extensions: ["", ".ts", ".tsx", ".js"]
	},
	devtool: 'source-map',
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
		compilerOptions: {
			declaration: false
		}
	},
	externals: {
		"react": { root: 'react', amd: 'react', commonjs2: 'react', commonjs: 'react' }
	}
};

module.exports = config;