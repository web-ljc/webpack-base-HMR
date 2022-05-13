const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin  = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  // 从入口文件进行编译，找到它依赖的模块，打包在一起，就会成为一个chunk文件
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
}