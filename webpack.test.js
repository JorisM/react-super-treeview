const path = require("path");
const nodeExternals = require("webpack-node-externals");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    target: "node",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.scss/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ["css-loader", "sass-loader"]
                })
            },
            {
                test: /\.jsx$/,
                include: /src/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/react"]
                        }
                    }
                ]
            },
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
