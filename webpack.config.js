const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',

  entry: './src/index.tsx',

  devtool: 'source-map',

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.gql', '.svg', '.json'],
    modules: ['src', 'node_modules'],
  },

  devServer: {
    port: 4444,
    hot: true,
    noInfo: true,
    // open: true,
    historyApiFallback: true,
    overlay: true,
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(svg|jpe?g|png|gif|webp)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
      },
    ],
  },
};
