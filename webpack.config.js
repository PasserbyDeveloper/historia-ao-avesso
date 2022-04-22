const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

process.env.NODE_ENV = 'development';

module.exports = {
	mode: process.env.NODE_ENV,
	entry: './index.js',
	output: {
		path: path.resolve(__dirname, 'docs'),
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			}
		]
	},
	plugins: [
		new MonacoWebpackPlugin({
			languages: ['typescript', 'javascript', 'css']
		})
	],
	devServer: {
		static: {
			directory: path.resolve(__dirname, 'dist'),
		},
		compress: false,
		port: 9000,
	}
};
