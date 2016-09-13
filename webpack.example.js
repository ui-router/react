var path = require("path");

var config = {
	entry: ["./example/app.tsx"],
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "bundle.js"
	},
	resolve: {
		extensions: ["", ".ts", ".tsx", ".js"]
	},
	devtool: "inline-source-map",
	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /(node_modules|__tests__)/
			}
		]
	}
};

module.exports = config;