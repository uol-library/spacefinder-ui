const fs = require('fs');
const path = require('path');

const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces/withplaceids' ), { encoding: 'utf8' } );
const allSpaces = [];
const spaceIDs = {};
spacefiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        var spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/withplaceids/', filename ) );
        const spaceJSON = JSON.parse( spaceData );
        if ( ! spaceIDs.hasOwnProperty(spaceJSON.google_place_id) ) {
            spaceIDs[spaceJSON.google_place_id] = [];
        }
        spaceIDs[spaceJSON.google_place_id].push( { id: spaceJSON.id, title: spaceJSON.title } );
    }
});
fs.writeFileSync(path.resolve( __dirname, '../_data/leeds/placeids.json' ), JSON.stringify(spaceIDs, null, '    '), err => {
    if (err) {
        console.error(err);
        return;
    }
});