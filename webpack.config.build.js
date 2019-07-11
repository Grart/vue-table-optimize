const merge = require('webpack-merge');

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css插件
const path = require('path');
const __dirnameOfAssets = "ATPiaoApp";

//分离CSS
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
class FixedMiniCssExtractPlugin extends MiniCssExtractPlugin
{
	// This very awful workaround prevents a weird `<undefined>.pop()` in the plugin
	// that's caused by who-knows-what (NOT related to dynamic imports).
	// See this github issue for details:
	// 修改css分离打包问题
	// https://github.com/webpack-contrib/mini-css-extract-plugin/issues/257
	renderContentAsset(compilation, chunk, modules, requestShortener)
	{
		const [chunkGroup] = chunk.groupsIterable;
		let rv;
		const getModuleIndex2 = chunkGroup.getModuleIndex2;
		try
		{
			chunkGroup.getModuleIndex2 = null;
			rv = super.renderContentAsset(compilation, chunk, modules, requestShortener);
		} finally
		{
			chunkGroup.getModuleIndex2 = getModuleIndex2;
		}
		return rv;
	}
}


module.exports = function (webpackConfig)
{
	webpackConfig = merge(
		webpackConfig,
		{
			mode: 'production',

			devtool: '',//source-map

			output: {
				filename: path.posix.join(__dirnameOfAssets, 'js/[name].[chunkhash].js'),
				chunkFilename: path.posix.join(__dirnameOfAssets, 'js/[name].[chunkhash].js')
			},
			plugins: [
				//new webpack.DefinePlugin({
				//	'process.env': { HOST_URL: "window.location.origin+window.location.pathname+'/api/v2'" }
				//}),
				new FixedMiniCssExtractPlugin(
					{
						filename: path.posix.join(__dirnameOfAssets, 'css/[name].[chunkhash].css'),
						chunkFilename: path.posix.join(__dirnameOfAssets, 'css/[name].[chunkhash].css')
					}
				),
				new OptimizeCssAssetsPlugin(),
			]
		}
	);


	webpackConfig.module.rules = webpackConfig.module.rules.concat(
		{
			test: /\.(css|less)$/,
			use: [
				MiniCssExtractPlugin.loader,
				{
					loader: 'css-loader'
				}
			]
		}
	);
	return webpackConfig
};