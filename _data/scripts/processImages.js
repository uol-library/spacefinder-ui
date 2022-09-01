const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const spaceimages = fs.readdirSync( path.resolve( __dirname, '../_data/cambridge/originalimages' ), { encoding: 'utf8' } );
spaceimages.forEach( img => {
    if ( img !== '.' && img !== '..' ) {
        console.log(path.resolve( __dirname, '../_data/cambridge/photos/'+img.substring(0, img.lastIndexOf(".")) + ".jpg" ));
        sharp(path.resolve( __dirname, '../_data/cambridge/originalimages/'+img ))
            .resize( { width: 500, height: 280 } )
            .jpeg( { quality: 70 } )
            .toFile( path.resolve( __dirname, '../_data/cambridge/photos/'+img.substring(0, img.lastIndexOf(".")) + ".jpg" ))
            .then(() => {

            });
    }
});



