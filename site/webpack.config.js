var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['regenerator-runtime/runtime.js', './src/index.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index_bundle.js',
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 8080,
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },
    mode: 'development',
    experiments: {
        topLevelAwait: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html',
        }),
    ],
};
