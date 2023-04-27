/**
 * Scheduled jobs for Spacefinder
 * 
 * Cron-style update tool used to process JSON files in spaces directory
 * according to settings in the "crontab" (_data/crontab.json).
 * 
 * Each "job" should be a JSON object with a date (d-m-yyyy) and updates array.
 * 
 * Updates match spaces on whatever field is specified in the match property of
 * an update, with the value given in the term property of the update. This way, 
 * multiple spaces can be matched to update them with the same information. 
 * 
 * Updates can be carried out on a single field or multiple fields for each space
 * matched - single fields use the properties field and value, multiple fields use
 * the properties fields and values (which must be identically sized arrays).
 * 
 * This is run daily by the GitHub action cron-updates (.github/workflows/cronUpdates.yml).
 */
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

const crontab = fs.readFileSync( path.resolve( __dirname, '../_data/crontab.json' ), { encoding: 'utf8' } );
const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
const cronJSON = JSON.parse( crontab );
const today = new Date();
const checkDay = today.getDate() + '-' + ( today.getMonth() + 1 ) + '-' + today.getFullYear();
console.log("Today's date: "+checkDay);
let updateCrontab = false;
cronJSON.jobs.forEach( job => {
    if ( job.date ) {
        console.log(job.updates.length+" job"+(job.updates.length > 1 ? "s": "" )+" queued for "+job.date);
        if ( job.date == checkDay ) {
            console.log("(this is today, so the crontab file would be updated)");
        }
        let allJSON = [];
        spacefiles.forEach( filename => {
            if ( filename !== '.' && filename !== '..' ) {
                /* get and parse data for space */
                let spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ) );
                allJSON.push( JSON.parse( spaceData ) );
            }
        });
        job.updates.forEach( s => {
            let matchedSpaces = [];
            console.log("Matching the field "+s.match+" with the term "+s.term);
            allJSON.forEach( sp => {
                if ( sp[s.match] === s.term ) {
                    matchedSpaces.push( sp );
                }
            });
            console.log("Matched "+matchedSpaces.length+" space"+(matchedSpaces.length > 1 ? "s": ""));
            if ( s.hasOwnProperty( 'field' ) && s.hasOwnProperty( 'value' ) ) {
                console.log("Updating single field "+s.field);
                matchedSpaces.forEach( ms => {
                    if ( ms[s.field] ) {
                        console.log("Field "+s.field+" found in space "+ms.title);
                        console.log("Updating value to:");
                        console.log(s.value);
                    } else {
                        console.error("Field "+s.field+" not found in space "+ms.title);
                    }
                });
            } else if ( s.hasOwnProperty( 'fields' ) && s.hasOwnProperty( 'values' ) ) {
                console.log("Updating multiple fields ("+s.fields.join('. ')+")");
                if ( s.fields.length == s.values.length ) {
                    for ( let i = 0; i < s.fields.length; i++ ) {
                        matchedSpaces.forEach( ms => {
                            if ( ms[s.fields[i]] ) {
                                console.log("Field "+s.fields[i]+" found in space "+ms.title);
                                console.log("Updating value to:");
                                console.log(s.values[i]);
                            } else {
                                console.error("Field "+s.fields[i]+" not found in space "+ms.title);
                            }
                        });
                    }
                } else {
                    console.error("Fields/Values number mismatch - fields: "+fields.length+" values:"+s.values.length);
                }
            } else {
                console.error("Fields/Values not specified fopr job");
            }
        });
    }
});
