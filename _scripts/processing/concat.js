/**
 * This script takes all the files within the spaces directory and compiles a master data file
 * in the root of the repository called spaces.json
 */
const fs = require('fs');
const path = require('path');
const spacefiles = fs.readdirSync( path.resolve( __dirname, '../../spaces' ), { encoding: 'utf8' } );
const allSpaces = [];
spacefiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        var data = fs.readFileSync( path.resolve( __dirname, '../../spaces/', filename ) );
        allSpaces.push( JSON.parse( data ) );
    }
});
fs.writeFileSync( path.resolve( __dirname, '../../spaces.json' ), JSON.stringify( allSpaces ) );



