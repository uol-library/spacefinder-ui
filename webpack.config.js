const path = require('path');

module.exports = {
    entry: {
       'spacefinder.js': [
            path.resolve(__dirname, '_includes/javascript/utilities.js' ),
            path.resolve(__dirname, '_includes/javascript/lazyload.js' ),
            path.resolve(__dirname, '_includes/javascript/layout.js' ),
            path.resolve(__dirname, '_includes/javascript/filters.js' ),
            path.resolve(__dirname, '_includes/javascript/list.js' ),
            path.resolve(__dirname, '_includes/javascript/map.js' )
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js']
    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, 'assets/scripts'),
    },
};