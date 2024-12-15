const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/renderer.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    resolve: {
        alias : {
            'face-api.js': path.resolve(__dirname, 'node_modules/face-api.js')
        },
        fallback: {
            fs: false, // Désactive le module fs
            buffer: require.resolve('buffer/'), // Polyfill pour buffer
            stream: require.resolve('stream-browserify'), // Polyfill pour stream
            vm: require.resolve('vm-browserify'), // Polyfill pour vm
        },
    },
    plugins: [
        // Fournir les polyfills comme variables globales si nécessaire
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'], // Ajoute Buffer comme variable globale
            process: 'process/browser', // Fournit une version navigateur de process
        }),
    ],
};
