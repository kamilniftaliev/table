const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',

  entry: './src/index.tsx',

  devtool: 'source-map',

  output: {
    path: `${__dirname}/public`,
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    publicPath: '/',
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.gql'],
    modules: ['src', 'node_modules'],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new SpriteLoaderPlugin(),
    new CompressionPlugin({
      cache: false,
      threshold: 240,
      test: /\.(html|js|svg)(\?.*)?$/i,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        options: {
          extract: true,
          spriteFilename: 'icons.svg',
        },
      },
      {
        test: /\.(jpe?g|png|gif|webp)?$/,
        exclude: /node_modules/,
        loader: 'file-loader',
      },
    ],
  },
};
