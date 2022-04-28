const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const spaceimages = fs.readdirSync( path.resolve( __dirname, '../_data/leeds/photos' ), { encoding: 'utf8' } );
spaceimages.forEach( img => {
    if ( img !== '.' && img !== '..' ) {
        sharp(path.resolve( __dirname, '../_data/leeds/photos/'+img ))
            .resize( { width: 500, height: 280 } )
            .jpeg( { quality: 70 } )
            .toFile( path.resolve( __dirname, '../assets/photos/'+img.substring(0, img.lastIndexOf(".")) + ".jpg" ))
            .then(() => {

            });
    }
});



