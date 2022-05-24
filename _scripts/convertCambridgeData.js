/**
 * Tool used to process Cambridge data into JSON files in spaces directory
 */
const fs = require('fs');
const path = require('path');
const data = fs.readFileSync( path.resolve( __dirname, '../_data/cambridge/spaces-24-05-2022.json' ), { encoding: 'utf8' } );
const fileJSON = JSON.parse( data );
var spaceID = 1;
var spacetypes = [];
var floorMap = {
    '1st floor': 'First floor',
    'First': 'First floor',
    'Fourth': 'Fourth floor',
    'Lower Ground Floor': 'Lower ground floor',
    'Ground Floor': 'Ground floor',
    '1st Floor': 'First floor',
    '2nd Floor': 'Second floor',
    'Third': 'Third floor',
    'Second': 'Second floor',
    ' ': '',
    'Lower Ground': 'Lower ground floor',
    '1': 'First floor',
    'Ground': 'Ground floor',
    '2': 'Second floor',
    'ground floor': 'Ground floor',
    '2nd and 3rd floors': 'Second and third floors',
    'First floor.': 'First floor',
    '1st': 'First floor',
    '2nd': 'Second floor',
    '3rd': 'Third floor',
    'Ground floor entrance': 'Ground floor',
    'First, Second and Third': 'First, second and third floors',
    'First ': 'First floor',
    '5th': 'Fifth floor',
    '3': 'Third floor',
    '1st Floor of the Baker Building': 'First floor'    
}
fileJSON.results.forEach( space => {
    const newspace = {
        id: spaceID,
        title: space.name,
        slug: string_to_slug(space.name),
        description: space.description,
        access: space.access,
        space_type: space.space_type,
        address: space.address,
        building: ( space.library == null ? '': space.library ),
        restricted: space.restricted,
        restriction: space.restriction,
        disabled_access: ( space.disabled_access == null ? false: space.disabled_access ),
        url: space.url,
        phone_number: space.phone_number,
        twitter_screen_name: space.twitter_screen_name,
        facebook_url: ( space.facebook_url == '' ? '': 'https://www.facebook.com/' + space.facebook_url),
        booking_url: ( space.booking_url == null ? '': space.booking_url ),
        noise: space.noise,
        atmosphere: [],
        facilities: [],
        work: [],
        tags: []
    };
    if ( spacetypes.indexOf( space.space_type ) == -1 ) {
        spacetypes.push( space.space_type );
    }
    if ( floorMap.hasOwnProperty( space.floor ) ) {
        newspace.floor = floorMap[space.floor];
    } else {
        newspace.floor = space.floor;
    }
    if ( space.images.length ) {
        let imgpath = "/mnt/home/repos/spacefinder-ruby/public" + space.images[0].replace('resized', 'original').replace(/\?.*$/, '');
        if ( fs.existsSync( imgpath ) ) {
            newspace.image = path.basename(imgpath).substring(0, path.basename(imgpath).lastIndexOf(".")) + ".jpg";
            newspace.imagealt = space.name;

        } else {
            newspace.image = '';
            newspace.imagealt = '';
        }
    } else {
        newspace.image = '';
        newspace.imagealt = '';
    }
    let geoJSON = {
        type: 'Point',
        coordinates: [space.lng, space.lat]
    };
    newspace.location = JSON.stringify(geoJSON);
    space.tags.forEach( tag => {
        newspace.tags.push( tag.name );
    });
    ["private","close","friends","group"].forEach( key => {
        if ( space['work_'+key] ) {
            newspace.work.push( key );
        }
    });
    space.facilities.forEach( fac => {
        newspace.facilities.push( fac.replace('facility_', '') );
    });
    space.atmosphere.forEach( atm => {
        newspace.atmosphere.push( atm.replace('atmosphere_', '') );
    });
    newspace.opening_hours = {};
    for ( day in space.term_time_hours ) {
        newspace.opening_hours[day] = {
            open: space.term_time_hours[day].open,
            from: ( space.term_time_hours[day].open ? space.term_time_hours[day].from.replace(/^0/g,''): '' ),
            to: ( space.term_time_hours[day].open ? space.term_time_hours[day].to.replace(/^0/g,''): '' )
        }
        if ( newspace.opening_hours[day].to == '0:00' ) {
            newspace.opening_hours[day].to = '24:00';
        }
    }
    fs.writeFile( path.resolve( __dirname, '../_data/cambridge/spaces/'+spaceID+'.json' ), JSON.stringify( newspace, null, '    ' ), err => {
        if (err) {
            console.error( err );
            return;
        }
    });
    spaceID++;
});
console.log(spacetypes);
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