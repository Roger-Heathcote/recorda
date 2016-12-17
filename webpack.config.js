var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './source/app.js',
  output: {
    filename: 'webpackbundle.js',
    path: './build'
  },
  devtool: "source-map",
  plugins: [
    new HtmlWebpackPlugin({
      template: 'source/index.html',
      inject: 'body'
    })
  ]
};
