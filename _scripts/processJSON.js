/**
 * Tool used to process JSON files in spaces directory
 */
const fs = require('fs');
const path = require('path');

/* what3words */
const what3words = require("@what3words/api");
const apiKey = '3EZMJ4IE';
const config = {
  host: 'https://api.what3words.com',
  apiVersion: 'v3',
}
const client = what3words.ConvertTo3waClient.init(apiKey, config);


const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
spacefiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        let spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ) );
        const spaceJSON = JSON.parse( spaceData );
        let geoJSON = JSON.parse( spaceJSON.location );
        spaceJSON.image = spaceJSON.images.length ? spaceJSON.images[0]: '';
        spaceJSON.imagealt = spaceJSON.title;
        delete spaceJSON.images;
        spaceJSON.slug = string_to_slug( spaceJSON.title );
        fs.writeFile( path.resolve( __dirname, '../_data/leeds/processed/'+spaceJSON.id+'.json' ), JSON.stringify( spaceJSON, null, '    ' ), err => {
            if (err) {
                console.error( err );
                return;
            }
        });

        /*let newGeoJSON = {
            type: 'Point',
            coordinates: [ geoJSON.coordinates[1], geoJSON.coordinates[0] ]
        };  
        spaceJSON.location = JSON.stringify( newGeoJSON );
        spaceJSON.tags = [];
        delete spaceJSON.expensive;
        if ( spaceJSON.library == "" ) {
            spaceJSON.library = false;
        }
        if ( ! spaceJSON.hasOwnProperty('building') ) {
            console.error(spaceJSON.title);
        }
        spaceJSON.opening_hours = getTimesForSpace( spaceJSON.id );
        if ( spaceJSON.opening_hours == false ) {
            console.log( spaceJSON.id + ": " + spaceJSON.title );
        }*/
        /*
        process coordinates to w3w
        client.run({ coordinates: { lat: geoJSON.coordinates[1],lng: geoJSON.coordinates[0] } })
            .then( response => {
                spaceJSON.w3w = response.words;
                fs.writeFile( path.resolve( __dirname, '../_data/leeds/processed/'+spaceJSON.id+'.json' ), JSON.stringify( spaceJSON, null, '    ' ), err => {
                    if (err) {
                        console.error( err );
                        return;
                    }
                });
            });
        */
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

function getTimesForSpace( spaceid ) {
    // Affine, Baines Wing Cafe, Cafe Maia, Cafe seven, Esther Simpson, FUSE, Hugo, LOMA, Parkinson Court
    if ( [84,1,5,8,4,2,11,9,6].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:30','15:00',false] );
    }
    // Parkinson
    // Term time: Monday-Thursday 9am-8.30pm, Friday 9am-7pm, Saturday-Sunday 10am-5pm
    // Vacation: Monday-Thursday 9am-7.30pm, Friday 9am-5pm, Saturday 10am-5pm
    if ( [27,28,29,30,60,61].indexOf( spaceid ) !== -1 ) {
        return getHours( ['9:00','9:00','9:00','9:00','9:00','10:00','10:00','20:30','20:30','20:30','20:30','19:00','17:00','17:00'] );
    }

    // Michael Sadler
    // Monday-Thursday 9.00am-9.30pm, Friday 9.00am-5pm, Sat 12-4pm
    if ( [19,20,21,22,23,24,25,26,31].indexOf( spaceid ) !== -1 ) {
        return getHours( ['9:00','9:00','9:00','9:00','9:00','12:00',false,'21:30','21:30','21:30','21:30','17:00','16:00',false] );
    }
    // Baines Wing
    // Monday-Thursday 9.00am-9.30pm, Friday 9.00am-5pm (termtime)
    // Monday-Thursday 9.00am-6pm, Friday 9.00am-5pm (vacation)
    if ( [14,15,16,17,18].indexOf( spaceid ) !== -1 ) {
        return getHours( ['9:00','9:00','9:00','9:00','9:00',false,false,'21:30','21:30','21:30','21:30','17:00',false,false] );
    }
    // Liberty Building
    // Monday-Thursday 9am-6pm, Friday 9am-5pm (termtime)
    // Monday-Friday 9am-5pm (vacation)
    if ( [39,40].indexOf( spaceid ) !== -1 ) {
        return getHours( ['9:00','9:00','9:00','9:00','9:00',false,false,'18:00','18:00','18:00','18:00','17:00',false,false] );
    }

    //E C Stoner
    // Monday-Friday 9.00am-6pm  (termtime)
    // Monday-Friday 9.00am-5.30pm (vacation)
    if ( [51,52].indexOf( spaceid ) !== -1 ) {
        return getHours( ['9:00','9:00','9:00','9:00','9:00',false,false,'18:00','18:00','18:00','18:00','17:00',false,false] );
    }

    // St. James, Psychology
    if ( [89,62,63].indexOf( spaceid ) !== -1 ) {
        return getHours( ['9:00','17:00',false] );
    }
    // Charles Thackrah, Esther Simpson, William Bragg, Clarendon, Chemistry, Chemistry West Block, Fine Art, Clothworkers Central, Social Sciences, Irene Manton
    if ( [37,41,53,47,48,34,43,44,45,46,54,55,49,50,64,56,57].indexOf( spaceid ) !== -1 ) {
        return getHours( ['9:00','18:00',false] );
    }
    // Brotherton
    if ( [83].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:00','8:00','8:00','8:00','8:00','10:00','10:00','20:30','20:30','20:30','20:30','19:00','17:00','17:00'] );
    }
    // Edward Boyle, Outdoor spaces
    if ( [71,72,73,74,12,13].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:00','8:00','8:00','8:00','8:00','10:00','10:00','24:00','24:00','24:00','24:00','24:00','24:00','24:00'] );
    }
    // Health Sciences library, Laidlaw library
    if ( [75,76,77,78,79,80,81,82].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:00','8:00','8:00','8:00','8:00','10:00','12:00','24:00','24:00','24:00','24:00','19:00','17:00','24:00'] );
    }
    // Maurice Keyworth
    if ( [38,58].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:00','8:00','8:00','8:00','8:00','9:00',false,'21:00','21:00','21:00','21:00','21:00','12:00',false] );
    }
    // LUU
    if ( [32].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:30','22:00',false] );
    }
    // 1915,The Edit Room
    if ( [10,3,12,13].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:30','16:00',false] );
    }
    // LOMA Express Dentistry
    if ( [85].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:30','14:30',false] );
    }
    // Caffe Nero Business School, Worsley, Chemical and process engineering, Electronic and Electrical Engineering, Mechanical Engineering
    if ( [86,65,66,67,68,69,70,33,42,35,36,59].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:00','18:00',false] );
    }
    // Caffe Nero Roger Stevens
    if ( [88].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:00','18:30',false] );
    }
    // Refectory
    if ( [7].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:00','18:30','10:00','14:00'] );
    }
    // Caffe Nero Laidlaw
    if ( [87].indexOf( spaceid ) !== -1 ) {
        return getHours( ['8:00','8:00','8:00','8:00','8:00','10:00','10:00','20:00','20:00','20:00','20:00','18:00','16:30','20:00'] );
    }
    return false;
}
function getHours( times ) {
    let days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    let fulltimes = {};
    switch (times.length) {
        case 2:
            days.forEach( d => {
                fulltimes[d] = { "open": true, "from": times[0], "to": times[1] };
            });
            break;
        case 3:
            days.forEach( d => {
                if ( d == "saturday" || d == "sunday" ) {
                    fulltimes[d] = { "open": false, "from": "", "to": "" };
                } else {
                    fulltimes[d] = { "open": true, "from": times[0], "to": times[1] };
                }
            });
            break;
        case 4:
            days.forEach( d => {
                if ( d == "saturday" || d == "sunday" ) {
                    fulltimes[d] = { "true": false, "from": times[2], "to": times[3] };
                } else {
                    fulltimes[d] = { "open": true, "from": times[0], "to": times[1] };
                }
            });
            break;
        case 14:
            days.forEach( (d, idx) => {
                if ( times[idx] == false ) {
                    fulltimes[d] = { "open": false, "from": "", "to": "" };
                } else {
                    fulltimes[d] = { "open": true, "from": times[idx], "to": times[(idx + 7)] };
                }
            });
            break;
        default:
            days.forEach( d => {
                fulltimes[d] = { "open": false, "from": "", "to": "" };
            });
            break;
    }
    return fulltimes;
}
