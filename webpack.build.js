var path = require("path");

var config = {
	entry: ["./src/index.ts"],
	output: {
		path: path.resolve(__dirname, "lib"),
		filename: "ui-router-react.js"
	},
	resolve: {
		extensions: ["", ".ts", ".tsx", ".js"]
	},
	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/
			}
		]
	}
};

module.exports = config;