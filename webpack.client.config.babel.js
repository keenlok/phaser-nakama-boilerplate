let resolve = require('path').resolve
let webpack = require('webpack')
let HtmlWebPackPlugin = require('html-webpack-plugin')

let clientConfig = {
  entry: {
    index: ["babel-polyfill", "./src/client/index.js"]
  },
  output: {
    path: resolve(__dirname, 'dist', 'public'),
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  watch: true,
  mode: 'development',
  target: 'web',
  devtool: '#source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        }
      },
      {
        test: /\.html$/,
        use: [ {
          loader: "html-loader",
          options: { minimize: true }
        }]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/test.html",
      filename: "./index.html"
    }),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    })
  ]
}

module.exports = clientConfig