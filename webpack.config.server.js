const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: process.env.NODE_ENV != 'production' ? 'development' : 'production',
  target: 'node',
  entry: path.resolve(__dirname, './src/server/app.js'),
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, './dist'),
  },
  stats: 'errors-warnings',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      { test: /\.jsx?$/, loader: 'babel-loader' },
      {
        test: /\.jsx?$/,
        loader: path.resolve(__dirname, './webpack/island-loader.js'),
      },
    ],
  },
  externals: [nodeExternals()],
}
