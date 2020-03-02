const path = require('path');
const webpack = require('webpack');
const stylusLoader = require('stylus-loader');
const stylus_plugin = require('poststylus');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
    const server = env && env.server ? env.server : 'https://che.openshift.io/';

    return {
        entry: [
            './src/index.tsx'
        ],
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader'
                },
                {
                    enforce: 'pre',
                    test: /\.(tsx|ts|jsx|js)$/,
                    loader: 'source-map-loader',
                    exclude: path.resolve(__dirname, 'node_modules'),
                },
                {
                    test: /\.css$/,
                    loaders: ['style-loader', 'css-loader']
                },
                {
                    test: /\.styl$/,
                    loader: 'style-loader!css-loader!stylus-loader',
                },
                {
                    test: /\.(jpg|svg|woff|woff2|ttf|eot|ico)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                },

            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './index.html'
            }),
            new stylusLoader.OptionsPlugin({
                default: {
                    use: [stylus_plugin()],
                },
            }),
            new webpack.HotModuleReplacementPlugin(),
        ],
        devtool: 'source-map',
        resolve: {
            extensions: ['.js', '.ts', '.tsx']
        },
        devServer: {
            port: 3000,
            hot: true,
            open: false,
            host: 'localhost',
            stats: 'errors-only',
            proxy: {
                '/api/websocket': {
                    target: server,
                    ws: true,
                    changeOrigin: true,
                    secure: false
                },
                '/api': {
                    target: server,
                    secure: false,
                    changeOrigin: true,
                    bypass(req) {
                        if (req.url === '/api/nope') {
                            return '/bypass.html';
                        }
                    },
                },
                '/ws': {
                    target: server.replace('http', 'ws'),
                    ws: true,
                    secure: false,
                    changeOrigin: true
                },
                '/workspace-loader': {
                    target: server,
                    secure: false,
                    changeOrigin: true
                },
            },
        }
    }
};