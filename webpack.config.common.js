/*******************************************************************************
 * Copyright (c) 2018-2018 Red Hat, Inc.
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which is available at http://www.eclipse.org/legal/epl-2.0.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 *******************************************************************************/

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { loadableTransformer } = require('loadable-ts-transformer');
const stylus_plugin = require('poststylus');
const stylusLoader = require('stylus-loader');
const webpack = require('webpack');
const LoadablePlugin = require('@loadable/webpack-plugin');

const path = require('path');

module.exports = {
    entry: {
        client: path.join(__dirname, 'src/index.tsx'),
    },
    output: {
        path: path.join(__dirname, 'build'),
        publicPath: '/',
        filename: 'client.js',
        chunkFilename: '[name].[chunkhash].js',
    },
    optimization: {
        chunkIds: 'named',
        splitChunks: {
            name: 'vendor',
            chunks: 'initial',
            cacheGroups: {
                default: false,
                vendors: false,
                monaco: {
                    name: 'monaco',
                    chunks: 'all',
                    priority: 25,
                    test: /monaco/
                },
                vendor: {
                    name: 'vendor',
                    chunks: 'all',
                    test: /node_modules/,
                    priority: 20
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    priority: 10,
                    reuseExistingChunk: true,
                    enforce: true
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            eslintPath: require.resolve('eslint'),
                        },
                        loader: require.resolve('eslint-loader'),
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            getCustomTransformers: () => ({ before: [loadableTransformer] }),
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /node_modules[\\\\|\/](yaml-language-server)/,
                loader: 'umd-compat-loader'
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
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    node: {
        fs: 'empty',
        net: 'empty',
        module: 'empty'
    },
    plugins: [
        new webpack.IgnorePlugin(/prettier/),
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new stylusLoader.OptionsPlugin({
            default: {
                use: [stylus_plugin()],
            },
        }),
        new CleanWebpackPlugin(),
        new LoadablePlugin(),
        new webpack.DefinePlugin({ __isBrowser__: "true" }),
    ],
};