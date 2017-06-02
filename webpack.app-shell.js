const path = require('path');
const AotPlugin = require('@ngtools/webpack').AotPlugin;
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const htmlPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs'
  }
})
const {RenderShellPlugin} = require('./tools/app-shell/render-shell-plugin.ts');
const paths = {
  app: path.join(process.cwd(), 'src/app'),
  src: path.join(process.cwd(), 'src'),
  node_modules: path.join(process.cwd(), 'node_modules'),
  globalStyles: path.join(process.cwd(), 'src/styles.scss')
};

module.exports = {
  target: 'node',
  entry: {
    appModule: path.resolve('src/app/app.server.module.ts')
  },
  externals: [nodeExternals()],
  node: {
    __dirname: false
  },
  resolve: {
    modules: [
      paths.src,
      paths.node_modules
    ],
    extensions: ['.ts', '.js', '.json']
  },
  output: {
    path: path.resolve('dist-prerender'),
    filename: '[name].bundle.js',
    // So I can: const AppShell = require('appShell.bundle.js').AppShell
    library: 'AppShell',
    libraryTarget: 'commonjs'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [
          'to-string-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        exclude: [
          /node_modules/,
          paths.globalStyles
        ],
        loaders: [
          'raw-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.html/,
        loader: 'raw-loader'
      },
      { test: /\.ts$/, loader: '@ngtools/webpack'}
    ]
  },
  plugins: [
    // Using AOTPlugin to have sass loading
    new AotPlugin({
      skipCodeGeneration: true,
      tsConfigPath: path.resolve('src/tsconfig.json'),
      entryModule: 'src/app/app.server.module#AppServerModule',
      hostReplacementPaths: {
        'src/environments/environment.ts': 'src/environments/environment.production.ts',
      }
    }),
    /**
     * Adds `defer` attribute to script tags to not block rendering:
     * `<script src="..." defer></script>`
     */
    new RenderShellPlugin({
      main: 'appModule.bundle.js',
      moduleName: 'AppServerModule',
      appRoot: 'app-root',
      /**
       * Can give a config for each shell to be rendered. Output is the file
       * name of the output, so a server could determine which shell to serve based on url.
       * For now we just write to root-shell.html, and copy that to _dist/index.html in a script outside of webpack.
       */
      shells: [{
        template: path.resolve('dist/index.html'),
        output: path.resolve('dist/index.html'),
        route: '/shell'
      }]
    })
  ]
};