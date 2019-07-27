const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
// 清除文件
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const __dirnameOfAssets = "assets";

const _babelOptions = {
	"presets": [
		[
			"@babel/preset-env",
			{
				"targets": {
					"chrome": "58",
					"ie": "11"
				},
				//"modules": false,//默认commonjs
				"useBuiltIns": "usage",
			}
		],
		"@vue/babel-preset-jsx"
	],
	"plugins": [
		"@babel/transform-runtime",
		'@babel/plugin-transform-modules-commonjs'
	]
};
const _webpackConfig ={
	mode: 'development',
	//src为程序运行起始路径,这个影响 entry 和 module 对应加载项的相对路径
	context: path.resolve(__dirname, 'src/'),
	entry: {
		app: './main.ts',
		// 将 第三方依赖 单独打包
		vendor: [
			'vue'
		]
	},
	resolve: {
		extensions: ['.js', '.ts', '.tsx', '.vue', '.json'],
		alias: {
			'vue$': 'vue/dist/vue.esm.js',
			'@': path.resolve(__dirname, 'src')
		}
	},
	output: {
		filename: '[name].[hash].js',
		path: path.resolve(__dirname, 'dist'),
		//publicPath: "WebApp"//网站起始路径
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist'
	},
	optimization: {
		//设置文件分割
		runtimeChunk: {
			name: "manifest"//runtime对应的文件名
		},
		splitChunks: {
			cacheGroups: {
				vue: {
					name: 'vue',
					test: /[\\/]node_modules[\\/](vue)[\\/]/,
					chunks: 'all',
					minSize: 2,
					priority: 10
				},
				libs: {
					name: 'libs',
					test: /[\\/]node_modules[\\/]/,
					chunks: 'all',
					minSize: 2,
					priority: 5
				},
				commons: {
					name: "commons",
					test: /[\\/]src[\\/]/,
					chunks: "all", //initial(初始块)、async(按需加载块)、all(全部块)
					minSize: 2,
					minChunks: 1,
					priority: 0
				},
				styles: {
					name: 'styles',
					test: /\.(scss|less|css)$/,
					chunks: 'all',
					minChunks: 1,
					reuseExistingChunk: true,
					enforce: true
				}
				//vendor: {
				//	name: 'vendor',
				//	test: /[\\/]node_modules[\\/]/,
				//	chunks: 'all',
				//	minSize: 2,
				//	priority: 5
				//}
			}
		}
		//minimizer: [
		//	// js mini
		//	new UglifyJsPlugin({
		//		cache: true,
		//		parallel: true,
		//		sourceMap: false // set to true if you want JS source maps
		//	}),
		//	// css mini
		//	new OptimizeCSSPlugin({})
		//]
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					//	loaders: {
					//		ts: 'ts-loader',
					//		tsx: 'babel-loader!ts-loader'
					//	}
					// 配置哪些引入路径按照模块方式查找
					transformAssetUrls: {
						video: ['src', 'poster'],
						source: 'src',
						img: 'src',
						image: 'xlink:href'
					}
				},
				exclude: [/node_modules/]
			},

			{
				test: /\.(ts|tsx)$/,
				//loader: 'babel-loader!ts-loader',
				use: [
					{
						loader: 'babel-loader',
						options: _babelOptions,
					},
					{
						loader: 'ts-loader',
						options: {
							appendTsSuffixTo: [/\.vue$/],
							transpileOnly: true//快速构建
						}
					}
				],
				exclude: /node_modules/
			},

			{
				test: /\.(js|jsx)$/,
				loader: 'babel-loader',
				options: _babelOptions,
				include: [
					path.resolve(__dirname, 'node_modules', 'iview'),
					path.resolve(__dirname, 'src')
				]
			},

			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 100,
					name: path.join(__dirnameOfAssets, 'img/[name].[hash:7].[ext]'),
					publicPath: '/',//指定css url()起始路径
				}
			},

			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 100,
					name: path.join(__dirnameOfAssets, 'media/[name].[hash:7].[ext]'),
					publicPath: '/',//指定css url()起始路径
				}
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 100,
					name: path.join(__dirnameOfAssets, 'fonts/[name].[hash:7].[ext]'),
					publicPath: '/',//指定css url()起始路径
				}
			}
		]
	},
	plugins: [
		//配置运行常量
		new webpack.DefinePlugin({
			//'process.env': { HOST_URL: "window.location.origin+window.location.pathname+'/api/v2'"}
			'process.env': { HOST_URL: "'http://localhost:5000/api/v2'"}
		}),
		//webpack.optimize.UglifyJsPlugin
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin(
			{
				//chunksSortMode: "manual" // manual根据chunks的位置手动排序
				chunksSortMode: 'manual',//none//Cyclic dependency 的解决方法
				title: '自动生成自定义标题',//如果使用了模板，就使用模板里的title，这里的title设置会失效，哪怕模板里的title为空
				template: __dirname + '/index.html',//需要编译的模板,可以是jade等第三方模板引擎也可以说纯html页面
				filename: 'index.html',//最终生成的文件名,默认是index.html
				hash: true,//是否给所有包含的js、css文件后面添加hash值,可以用来清除缓存，但好像不是很管用
				inject: true,// | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中。
				chunks: ['styles', 'manifest', 'vue', 'libs', 'commons', 'app'] ,//指定生成的文件demo.hmtl需要包括entry里的哪些入口文件(这里是index,main.js不会引入),不设置的话所以入口js文件都会被引入进来

				minify: {
					removeComments: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true
				}
			}
		),
		new VueLoaderPlugin(),
		//new LessVariablesPlugin()
	],
	//resolveLoader: {
	//	modules: ['node_modules'],
	//	extensions: ['.js', '.json'],
	//	//mainFields: ['loader', 'main']
	//},
};


//判断当前运行模式（打包还是调试），加载不同的配置
if (process.argv[1].endsWith('webpack-dev-server.js'))
{
	//npm run dev
	console.log('webpack.config.dev');
	module.exports = require('./webpack.config.dev')(
		_webpackConfig
	);
}
else
{
	//npm run build
	console.log('webpack.config.build');
	module.exports = require('./webpack.config.build')(
		_webpackConfig
	);
}