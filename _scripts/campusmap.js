/**
 * This script scans through data used by the campus map (downloaded March 30, 2022)
 * and spits out a JSON file which can be used to map building names to location IDs
 */
const fs = require('fs');
const path = require('path');

const data = fs.readFileSync( path.resolve( __dirname, '../_data/leeds/campusmap.json' ), { encoding: 'utf8' } );
const fileJSON = JSON.parse( data );
const cleanedJSON = [];
fileJSON[0].buildings.forEach( bldg => {
    cleanedJSON.push({
        'id': bldg.id,
        'title': bldg.title
    });
});
fs.writeFile( path.resolve( __dirname, '../_data/leeds/campusmap_lookup.json' ), JSON.stringify( cleanedJSON, null, '    ' ), err => {
    if (err) {
        console.error( err );
        return;
    }
});

