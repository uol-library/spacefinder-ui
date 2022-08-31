const fs = require('fs');
const path = require('path');
const UglifyJS = require("uglify-js");
const jsdir = '../_includes/javascript/';
/*const code = {
    "utilities.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'utilities.js' ) ),
    "config.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'config.js' ) ),
    "layout.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'layout.js' ) ),
    "filters.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'filters.js' ) ),
    "spaces.js ": fs.readFileSync( path.resolve( __dirname, jsdir, 'spaces.js' ) ),
    "map.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'map.js' ) ),
    "routing.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'routing.js' ) ),
    "analytics.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'analytics.js' ) ),
    "accordion.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'components/accordion.js' ) ),
    "modal.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'components/modal.js' ) )
};
const options = { toplevel: true };
let minified = UglifyJS.minify( code, options );
console.log( minified );*/
fs.writeFileSync( path.resolve( __dirname, '../assets/scripts/bundle.min.js' ), UglifyJS.minify({
    "utilities.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'utilities.js' ), "utf8" ),
    "layout.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'layout.js' ), "utf8" ),
    "filters.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'filters.js' ), "utf8" ),
    "spaces.js ": fs.readFileSync( path.resolve( __dirname, jsdir, 'spaces.js' ), "utf8" ),
    "map.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'map.js' ), "utf8" ),
    "routing.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'routing.js' ), "utf8" ),
    "analytics.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'analytics.js' ), "utf8" ),
    "accordion.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'components/accordion.js' ), "utf8" ),
    "modal.js": fs.readFileSync( path.resolve( __dirname, jsdir, 'components/modal.js' ), "utf8" )
}, { toplevel: true } ).code, "utf8" );
