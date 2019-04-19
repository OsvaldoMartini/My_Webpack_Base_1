module.exports = {
    entry: ['./src/index.js'],
    output: {
      path: __dirname,
      publicPath: '/',
      filename: 'bundle.js'
    },
    module: {
      loaders: [
        {
          exclude: /node_modules/,
          loader: 'babel',
          query: {
            presets: ['react', 'es2015', 'stage-1']
          }
        },
        {
          test: /.css$/,
          loader: 'style-loader'
        }, 
        {
          test: /.css$/,
          loader: 'css-loader',
          query: {
              modules: true,
              localIdentName: "[name][local]_[hash:base64:5]"
            }
        }
      ],
      // rules: [
      //   {
      //     test: /\.css$/,
      //     use: [
      //       'style-loadder',
      //       'css-loadder'
      //     ]
      //   },
    //],

    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    devServer: {
      historyApiFallback: true,
      contentBase: './',
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      }
    }
  };
  