const HtmlWebPackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  output: {
    path: `${__dirname}/build`,
    publicPath: '/build/',
    filename: '[name].js',
  },
  context: `${__dirname}/src`,
  entry: {
    foreground: 'foreground.js',
    options: 'options.js',
    popup: 'popup.js',
  },
  resolve: {
    modules: [`${__dirname}/src`, 'node_modules'],
    alias: {
      react: `${__dirname}/node_modules/react`,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        '*.html',
        'background.js',
        {
          from: 'browser',
          context: '..',
        },
      ]
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new HtmlWebPackPlugin(),
      '...',
    ]
  }
}