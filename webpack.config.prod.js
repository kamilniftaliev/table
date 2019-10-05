const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',

  entry: './src/index.tsx',

  devtool: 'source-map',

  devServer: {
    port: 4444,
    hot: true,
    noInfo: true,
    // open: true,
    historyApiFallback: true,
    overlay: true,
  },

  output: {
    path: `${__dirname}/public`,
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js',
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
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
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
