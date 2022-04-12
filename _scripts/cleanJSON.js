/**
 * This script loads spacefinder data taken from a spreadsheet and creates
 * separate JSON files for each space to use in the GitHub Pages site with
 * NetlifyCMS. These individual space files are then concatenated to form
 * the main data file which drives the application (using a GitHub Action).
 */
const fs = require('fs');
const path = require('path');

const data = fs.readFileSync( path.resolve( __dirname, '../_data/leeds/spacefinder-leeds.json' ), { encoding: 'utf8' } );
const fileJSON = JSON.parse( data );
const cmapdata = fs.readFileSync( path.resolve( __dirname, '../_data/leeds/campusmap_lookup.json' ), { encoding: 'utf8' } );
const cmapJSON = JSON.parse( cmapdata );
const cleanedJSON = [];
const BreakException = {};
const fieldMapping = {
    "title": "Enter space name below e.g. first floor west, the red bean bags or relaxed reading space",
    "basic_info": "Basic info",
    "description": "Text description of space",
    "access": "Who can use the space?",
    "space_type": "Type of space",
    "library": "In library",
    "address": "Street address",
    "floor": "Floor",
    "lat": "Decimal GPS coordinates (lattitude) eg 52.197949",
    "lng": "Decimal GPS coordinates (longitude) eg 0.122951",
    "restricted": "Access restrictions",
    "restriction": "Description of access restriction",
    "disabled_access": "Disabled access",
    "url": "Website URL",
    "phone_number": "Phone number",
    "twitter_screen_name": "Twitter",
    "facebook_url": "Facebook page",
    "expensive": "If this is a café, restaurant or bar how expensive is it?(1 = cheap, 5 = expensive)"
};
const facilitiesMapping = {
    "Food & drink allowed": "food_drink",
    "Natural daylight": "daylight",
    "Attractive views out of the window": "views",
    "Large desks": "large_desks",
    "Free Wifi": "free_wifi",
    "No WiFi": "no_wifi",
    "Computers": "computers",
    "Laptops allowed": "laptops_allowed",
    "Plug sockets": "sockets",
    "Phone signal": "signal",
    "Printers and copiers": "printers_copiers",
    "Whiteboards": "whiteboards",
    "Projector": "projector",
    "Outdoor seating": "outdoor_seating",
    "Bookable": "bookable",
    "Toilets nearby": "toilets",
    "Close to refreshments": "refreshments",
    "Close to a place to take a break": "break",
};
const atmosphereMapping = {
    "Disciplined?": "disciplined",
    "Relaxed or informal?": "relaxed",
    "Historic?": "historic",
    "Modern?": "modern",
    "Inspiring or thought provoking?": "inspiring",
    "Cosy?": "cosy",
    "Social?": "social",
    "Friendly or welcoming?": "friendly"
};
const workMapping = {
    "...in private?": "private",
    "...close to others?": "close",
    "...alongside friends?": "friends",
    "...in a group?": "group"
};
const typeMapping = {
    'Refectory': 'Restaurant',
    'Outdoor café': 'Café',
    'Seminal Communal Areas': 'Seminar room',
    'Library': 'Library space',
    'Library ': 'Library space'
};
function lookup_campusmap_url( title ) {
    var url = '';
    cmapJSON.forEach(n => {
        if ( title.indexOf( n.title ) !== -1 ) {
            url = 'https://www.leeds.ac.uk/campusmap?location='+n.id;
        }
    });
    return url;
}
var spaceID = 1;
var spaceTypes = [];
fileJSON.forEach( space => {
    const newspace = {
        "id": spaceID,
        "location": {},
        work: [],
        atmosphere: [],
        images: [],
        facilities: []
    };
    for (f in fieldMapping) {
        if ( f === "twitter_screen_name" ) {
            newspace[f] = space[fieldMapping[f]].replace("https://twitter.com/", "");
        } else if ( f === "space_type" ) {
            if ( typeMapping.hasOwnProperty( space[fieldMapping[f]] ) ) {
                newspace[f] = typeMapping[space[fieldMapping[f]]];
            } else {
                newspace[f] = space[fieldMapping[f]];
            }
            if ( newspace[f] == 'Library space' ) {
                newspace.work.push('in_a_library')
            }
        } else if ( f === 'basic_info' ) {
            newspace[f] = space[fieldMapping[f]].replace(" https://www.leeds.ac.uk/campusmap", "");
        } else {
            newspace[f] = ( space[fieldMapping[f]] == "no" ? false: ( space[fieldMapping[f]] == "yes" ? true: space[fieldMapping[f]] ) );
        }
    }
    if ( newspace.hasOwnProperty('lat') && newspace.hasOwnProperty('lng') ) {
        let geoJSON = {
            type: 'Point',
            coordinates: [newspace.lat, newspace.lng]
        };
        newspace.location = JSON.stringify(geoJSON);
    }
    delete( newspace.lat );
    delete( newspace.lng );
    newspace.campusmap_url = lookup_campusmap_url( space[fieldMapping.title] );
    try {
        ["Strictly silent", "Whispers", "Background chatter", "Animated discussion", "Music playing"].forEach(n => {
            if (space[n] == "x") {
                newspace.noise = n;
                throw BreakException;
            }
        });
    } catch (e) {
        if ( e !== BreakException ) throw e;
    }
    for (fac in facilitiesMapping) {
        if ( space[fac] !== "" ) {
            newspace.facilities.push(facilitiesMapping[fac]);
        }
    }
    for (atm in atmosphereMapping) {
        if ( space[atm] !== "" ) {
            newspace.atmosphere.push(atmosphereMapping[atm]);
        }
    }
    for (w in workMapping) {
        if ( space[w] !== "" ) {
            newspace.work.push(workMapping[w]);
        }
    }
    if ( space['Tags'] !== '' ) {
        newspace.tags = space['Tags'].split(',').map( el => {
            return el.trim();
        });
    } else {
        newspace.tags = [];
    }
    cleanedJSON.push(newspace);
    fs.writeFile( path.resolve( __dirname, '../spaces/'+spaceID+'.json' ), JSON.stringify( newspace, null, '    ' ), err => {
        if (err) {
            console.error( err );
            return;
        }
    });

    spaceID++;
});
