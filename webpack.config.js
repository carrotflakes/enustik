const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const context = __dirname + '/src';

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  context,
  entry: [
    'babel-polyfill',
    './index.js'
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  devServer: {
    contentBase: 'build',
    port: 3000,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: [
            '@babel/transform-react-jsx',
            [
              'react-css-modules',
              {
                context
              }
            ]
          ]
        }
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, './src'),
        loaders: [
          'style-loader',
          'css-loader?modules&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: '../public/index.html',
      filename: 'index.html'
    })
  ]
};
