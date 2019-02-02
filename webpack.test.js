const path = require('path');
const nodeExternals = require("webpack-node-externals");

module.exports = {
    target: 'node',
    module: {
    rules: [
      {
        test: /\.(png|jpg|gif|woff|ico|woff2|svg|css|sass|scss|less|styl)$/,
        loader: "null-loader"
      },
        {
          test: /\.(ts|tsx)$/,
          include: /src/,
          use: [
            {
              loader: require.resolve("ts-loader"),
              options: {
                transpileOnly: false,
                experimentalWatchApi: true
              }
            }
          ]
        }
    ]
  },
  externals: [nodeExternals()]
};
