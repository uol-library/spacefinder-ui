
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const node_api_key = "AIzaSyC3foCF1zU04CMjpavzHg_1lFiA7hojJRM";
const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
const allSpaces = [];
spacefiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename !== 'withplaceids' ) {
        var spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ) );
        const spaceJSON = JSON.parse( spaceData );
        const queryURL = new URL( "https://maps.googleapis.com/maps/api/place/findplacefromtext/json" );
        queryURL.searchParams.append( "fields", "place_id" );
        queryURL.searchParams.append( "inputtype", "textquery" );
        queryURL.searchParams.append( "input", spaceJSON.title );
        queryURL.searchParams.append( "locationbias", "circle:20@"+spaceJSON.lat+","+spaceJSON.lng );
        queryURL.searchParams.append( "key", node_api_key );
        axios({
            method: 'get',
            url: queryURL.href,
            headers: {}
        }).then( response => {
            if ( response.data.status == "OK" && response.data.candidates.length ) {
                spaceJSON.google_place_id = response.data.candidates[0].place_id;
                fs.writeFileSync(path.resolve( __dirname, '../spaces/withplaceids/', filename ), JSON.stringify(spaceJSON), err => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
            }
        }).catch( error => {
            console.error( error );
        });
    }
});
