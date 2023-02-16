const path = require('path')
const glob = require('glob')
const CopyPlugin = require('copy-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const isDev = process.env.NODE_ENV !== 'production'

const entryPoints = glob
  .sync(path.resolve(__dirname, './.generated') + '/**/*.client.js', {
    absolute: true,
  })
  .reduce((acc, path) => {
    const entry = path.match(/[^\/]+\.jsx?$/gm)[0].replace(/.jsx?$/, '')
    acc[entry] = path
    return acc
  }, {})

const output = {
  filename: '[name].js',
  chunkFilename: '[id].js',
  path: path.resolve(__dirname, './dist/js'),
}

if (!isDev) {
  output.filename = '[name].[chunkhash].js'
  output.chunkFilename = '[id].[chunkhash].js'
}

module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'inline-cheap-source-map' : false,
  entry: entryPoints,
  output: output,
  stats: 'errors-warnings',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    minimize: !isDev,
  },
  module: {
    rules: [{ test: /\.jsx?$/, loader: 'babel-loader' }],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'src/public', to: '../' }],
    }),
    new WebpackManifestPlugin({
      basePath: '',
      publicPath: '',
      filter: file => {
        return /\.client?/.test(file.name)
      },
    }),
  ],
}
