/**
 * Scheduled jobs for Spacefinder
 * 
 * Cron-style update tool used to process JSON files in spaces directory
 * according to settings in the "crontab" (_data/crontab.json).
 * Each "job" should be a JSON object with a date (d-m-yyyy) and updates array.
 * Updates match spaces on the title field (as this is usually in
 * the data provided for updates), and updates can be carried out on a
 * single field for each space.
 * 
 * Could be enhanced to match spaces on a different field (id for example) or even
 * match spaces using
 * 
 * This is run daily by the GitHub action cron-updates (.github/workflows/cronUpdates.yml)
 * at 4:05am.
 */
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

const crontab = fs.readFileSync( path.resolve( __dirname, '../_data/crontab.json' ), { encoding: 'utf8' } );
const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
const cronJSON = JSON.parse( crontab );
const today = new Date();
const checkDay = today.getDate() + '-' + ( today.getMonth() + 1 ) + '-' + today.getFullYear();
const newCrontab = {jobs:[]};
let updateCrontab = false;
cronJSON.jobs.forEach( job => {
    if ( job.date == checkDay ) {
        updateCrontab = true;
        const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
        spacefiles.forEach( filename => {
            if ( filename !== '.' && filename !== '..' ) {
                let spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ) );
                const spaceJSON = JSON.parse( spaceData );
                job.updates.forEach( s => {
                    if ( spaceJSON.title == s.title ) {
                        if ( s.hasOwnProperty( 'field' ) && s.hasOwnProperty( 'value' ) ) {
                            spaceJSON[s.field] = s.value;
                        } else if ( s.hasOwnProperty( 'fields' ) && s.hasOwnProperty( 'values' ) ) {
                            if ( s.fields.length == s.values.length ) {
                                for ( let i = 0; i < s.fields.length; i++ ) {
                                    spaceJSON[s.fields[i]] = s.values[i];
                                }
                            }
                        } 
                        fs.writeFile( path.resolve( __dirname, '../spaces/'+spaceJSON.id+'.json' ), JSON.stringify( spaceJSON, null, '    ' ), err => {
                            if (err) {
                                console.error( err );
                                return;
                            }
                        });
                    }
                });
            }
        });
    } else {
        newCrontab.jobs.push(job);
    }
});
if ( updateCrontab ) {
    fs.writeFile( path.resolve( __dirname, '../_data/crontab.json' ), JSON.stringify( newCrontab, null, '    ' ), err => {
        if (err) {
            console.error( err );
            return;
        }
    });
}
