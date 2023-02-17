/**
 * Updates opening hours for library spaces in spacefinder using
 * the feed from the library calendar:
 * 
 * https://library.leeds.ac.uk/opening-hours-calendar
 * 
 * This data file is a JSON object containing opening hours which
 * is updated regularly by library staff and drives the opening
 * hours and calendar on the library website.
 * 
 * Data from this file is used to update spaces whose space_type
 * is set to "Library" by looking in the building field which contains
 * either the library name or the "Worsley building" for the Health
 * Sciences library. Existing opening hours are first compared with
 * those in the data to see if they differ.
 * 
 * The script will update opening times for the current week, starting
 * on Monday. This means it should be used on Monday morning to update
 * data in spacefinder for the current week (on a schedule).
 */
const fs = require('fs');
const path = require('path');
fs.readFile( path.resolve( __dirname, '../_data/leeds/opening-hours.json' ), (err, data) => {
    if (err) throw err;
    let openingJSON = JSON.parse( data );
    let opening = {};
    // get opening hours for each library using keys
    ['edward','brotherton','health','laidlaw'].forEach( lib => {
        opening[lib] = {};
        let weekdates = getWeekDates();
        weekdates.forEach( dates => {
            opening[lib][dates.day] = getOpeningHours( openingJSON.library[ lib ], dates.datestring );
        });
    });
    const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
    spacefiles.forEach( filename => {
        if ( filename !== '.' && filename !== '..' ) {
            var spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ) );
            const spaceJSON = JSON.parse( spaceData );
            if ( spaceJSON.space_type == 'Library' ) {
                let update = false;
                switch ( spaceJSON.building ) {
                    case "Edward Boyle library":
                        if ( openingHoursDiffer( spaceJSON.opening_hours, opening.edward ) ) {
                            spaceJSON.opening_hours = opening.edward;
                            update = true;
                        }
                        break;
                    case "Worsley building":
                        if ( openingHoursDiffer( spaceJSON.opening_hours, opening.health ) ) {
                            spaceJSON.opening_hours = opening.health;
                            update = true;
                        }
                        break;
                    case "Laidlaw library":
                        if ( openingHoursDiffer( spaceJSON.opening_hours, opening.laidlaw ) ) {
                            spaceJSON.opening_hours = opening.laidlaw;
                            update = true;
                        }
                        break;
                    case "Brotherton Library":
                        if ( openingHoursDiffer( spaceJSON.opening_hours, opening.brotherton ) ) {
                            spaceJSON.opening_hours = opening.brotherton;
                            update = true;
                        }
                        break;
                }
                // check the flag to see if an update has been performed
                if ( update ) {
                    fs.writeFileSync(path.resolve( __dirname, '../spaces/', filename ), JSON.stringify(spaceJSON), err => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                }
            }
        }
    });
} );

 
/**
 * Gets an array of objects containing days of the week with their
 * corresponding dates in YYYY-MM-DD format. The dates are used to identify
 * opening hours in the JSON data feed for the library website. Dates
 * are based on the previous monday to the current date.
 * @returns {Array} array of objects with day and datestring properties
 */
function getWeekDates() {
    let weekdates = [];
    let d = new Date();
    let days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    /* set date to previous monday */
    d.setDate( d.getDate() - ( ( d.getDay() + 6 ) % 7 ) );
    for ( let i = 0; i < 7; i++ ) {
        let datestring = d.getFullYear() + '-' + ( '0' + ( d.getMonth() + 1 ) ).slice( -2 ) + '-' + ( '0' + d.getDate() ).slice( -2 );
        weekdates.push ( { 'day': days[i], 'datestring': datestring } );
        d.setDate( d.getDate() + 1 );
    }
    return weekdates;
}
function getOpeningHours( data, datestr ) {
    let opening = { 'open': false, 'from': '', 'to': '' };
    data.forEach( d => {
        let regex = /([0-9]+:[0-9]+)/ig;
        if ( d.date == datestr ) {
            let hours = d.open.match( regex );
            if ( hours != null && hours.length >= 2 ) {
                opening = { 'open': true, 'from': hours[0].replace(/^0/g,''), 'to': hours[1].replace(/^0/g,'') };
            } else if ( d.open.toLowerCase().includes( '24 hour' ) ) {
                opening = { 'open': true, 'from': '0:00', 'to': '24:00' };
            }
        }
    });
    return opening;
}
function openingHoursDiffer( o1, o2 ) {
    let differ = false;
    ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].forEach( day => {
        if ( o1[day].open != o2[day].open || o1[day].from != o2[day].from || o1[day].to != o2[day].to ) {
            differ = true;
        }
    });
    return differ;
}