/**
 * Tool used to process JSON files in spaces directory
 */
const fs = require('fs');
const path = require('path');

/* what3words */
/*
const what3words = require("@what3words/api");
const apiKey = '3EZMJ4IE';
const config = {
  host: 'https://api.what3words.com',
  apiVersion: 'v3',
}
const client = what3words.ConvertTo3waClient.init(apiKey, config);
*/

const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
spacefiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        let spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ) );
        const spaceJSON = JSON.parse( spaceData );
        let geoJSON = JSON.parse( spaceJSON.location );
        if ( spaceJSON.url == '' || spaceJSON.url == 'https://students.leeds.ac.uk/info/10109/study_support/1419/where_to_study_on_campus' ) {
            spaceJSON.url == '';
            spaceJSON.url_text = '';
        } else if ( spaceJSON.url.match( 'mytimetable.leeds.ac.uk' ) ) {
            spaceJSON.url_text = 'View timetable for ' + spaceJSON.title;
        } else if ( spaceJSON.url == 'https://library.leeds.ac.uk/' ) {
            spaceJSON.url_text = 'Visit the Library website';
        } else {
            spaceJSON.url_text = 'Visit the ' + spaceJSON.title + ' web site';
        }
        
        /*
        selectively publish / unpublish spaces
        if ( ['title 1', 'title 2'].indexOf( spaceJSON.title ) != -1 ) {
            spaceJSON.published = false;
        } else {
            spaceJSON.published = true;
        }

        remove a facility from a space
        if ( spaceJSON.facilities.indexOf('to_remove') != -1 ) {
            spaceJSON.facilities.splice( spaceJSON.facilities.indexOf('to_remove'), 1 );
        }

        add facilities to all spaces
        ['facility 1','facility 2'].forEach( f => {
            if ( spaceJSON.facilities.indexOf( f ) == -1 ) {
                spaceJSON.facilities.push( f );
            }
        });

        add facilities to spaces by title
        if ( ['title 1', 'title 2'].indexOf( spaceJSON.title ) != -1 ) {
            if ( spaceJSON.facilities.indexOf('facility') == -1 ) {
                spaceJSON.facilities.push('facility');
            }
        }
        */
        // write results to file
        fs.writeFile( path.resolve( __dirname, '../spaces/'+spaceJSON.id+'.json' ), JSON.stringify( spaceJSON, null, '    ' ), err => {
            if (err) {
                console.error( err );
                return;
            }
        });
    }
});

function string_to_slug (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}
