/**
 * Updates spaces to ensure they are consistent with defined filters.
 * Should be run as a maintenance job each time the _data/filters.yml
 * file is updated.
 */
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const filtersyaml = fs.readFileSync( path.resolve( __dirname, '../_data/filters.yml' ), { encoding: 'utf8' } );
const f = YAML.parse( filtersyaml );
const spacefiles = fs.readdirSync( path.resolve( __dirname, '../spaces' ), { encoding: 'utf8' } );
spacefiles.forEach( filename => {
    if ( filename !== '.' && filename !== '..' ) {
        var spaceData = fs.readFileSync( path.resolve( __dirname, '../spaces/', filename ) );
        const spaceJSON = JSON.parse( spaceData );
        let needsUpdate = false;
        f.filters.forEach( filter => {
            let optionkeys = [];
            filter.options.forEach( o => {
                optionkeys.push( o.key );
            })
            if ( filter.key !== 'open' ) {
                if ( spaceJSON[ filter.key ] ) {
                    if ( typeof spaceJSON[ filter.key ] == "String" ) {
                        if ( optionkeys.indexOf( spaceJSON[ filter.key ] ) === -1 ) {
                            needsupdate = true;
                            spaceJSON[ filter.key ] = '';
                            console.log( 'filter value '+spaceJSON[ filter.key ]+' for key '+filter.key+' not found in available options for space ID '+spaceJSON.id );
                        }
                    } else if ( Array.isArray( spaceJSON[ filter.key ] ) ) {
                        let newData = [];
                        for ( let i = 0; i < spaceJSON[ filter.key ].length; i++ ) {
                            if ( optionkeys.indexOf( spaceJSON[ filter.key ][i] ) === -1 ) {
                                needsupdate = true;
                                console.log( 'filter value '+spaceJSON[ filter.key ][i]+' for key '+filter.key+' not found in available options for space ID '+spaceJSON.id );
                            } else {
                                newData.push( spaceJSON[ filter.key ][i] );
                            }
                        }
                        spaceJSON[ filter.key ] = newData;
                    }
                } else {
                    console.log( 'key '+filter.key+' not found in space ID '+spaceJSON.id );
                }
            }
        });
        if ( false && needsUpdate ) {
            fs.writeFile( path.resolve( __dirname, '../spaces/'+spaceJSON.id+'.json' ), JSON.stringify( spaceJSON, null, '    ' ), err => {
                if (err) {
                    console.error( err );
                    return;
                }
            });
        
        }
    }
});
