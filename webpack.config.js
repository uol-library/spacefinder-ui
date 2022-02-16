const path = require('path');

module.exports = {
    entry: {
       'spacefinder.js': [
            path.resolve(__dirname, '_includes/javascript/infobubble.js' ),
            path.resolve(__dirname, '_includes/javascript/icon-map.js' ),
            path.resolve(__dirname, '_includes/javascript/moment.js' ),
            path.resolve(__dirname, '_includes/javascript/lazyload.js' ),
            path.resolve(__dirname, '_includes/javascript/search.js' ),
            path.resolve(__dirname, '_includes/javascript/utilities.js' ),
            path.resolve(__dirname, '_includes/javascript/templates.js' ),
            path.resolve(__dirname, '_includes/javascript/app.js' )
        ]
    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, 'assets/scripts'),
    },
};