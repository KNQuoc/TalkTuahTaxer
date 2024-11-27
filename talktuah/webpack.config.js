const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        popup: './src/popup.tsx',
        content: './src/features/content.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public' }, // This will copy all files from public to dist
            ],
        }),
    ],
};