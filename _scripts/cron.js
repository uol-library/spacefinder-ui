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
 * Could be enhanced to match on a different field (id for example) and perform
 * multiple updates for each space.
 * 
 * This is run daily by the GitHub action cron-updates (.github/workflows/cronUpdates.yml)
 * at 4:05am.
 */
const fs = require('fs');
const path = require('path');

const crontab = fs.readFileSync( path.resolve( __dirname, '../_data/crontab.json' ), { encoding: 'utf8' } );
const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
const cronJSON = JSON.parse( crontab );
const today = new Date();
const checkDay = today.getDate()+'-'+today.getMonth()+'-'+today.getFullYear();
cronJSON.jobs.forEach( job => {
    if ( job.date == checkDay ) {
        const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
        spacefiles.forEach( filename => {
            if ( filename !== '.' && filename !== '..' ) {
                let spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ) );
                const spaceJSON = JSON.parse( spaceData );
                job.updates.forEach( s => {
                    if ( spaceJSON.title == s.title ) {
                        spaceJSON[s.field] = s.value;
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
    }
});
