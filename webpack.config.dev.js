
const webpack = require('webpack');
const merge = require('webpack-merge');

module.exports = function (webpackConfig)
{
	webpackConfig = merge(
		webpackConfig,
		{
			mode: 'development',

			//  源码映射,影响构建速度
			//  https://webpack.docschina.org/configuration/devtool
			devtool: 'inline-source-map',    //  使用 source map

			//  启用模块热替换(hot module replacement 或 HMR)
			devServer: {
				contentBase: './dist',
				hot: true,
				port: 8888
			},
			plugins: [
				//new webpack.DefinePlugin({
				//	'process.env': { HOST_URL: "'http://localhost:5000/api/v2'" }
				//}),
				new webpack.HotModuleReplacementPlugin()
			],
		}
	);

	webpackConfig.module.rules = webpackConfig.module.rules.concat(
			{
				test: /\.(css|less)$/,
				use:[
						'vue-style-loader',
						{
							loader: 'style-loader'
						},
						{
							loader: 'css-loader'
							//options: {
							//	//启用局部作用域 CSS https://www.webpackjs.com/loaders/css-loader/#modules
							//	modules: true,
							//	// customize generated class names
							//	localIdentName: '[local]_[hash:base64:8]'
							//}
						}
					]
			}
	);
	return webpackConfig;
}