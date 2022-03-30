var spacesurl = 'https://uol-library.github.io/spacefinder-ui/spaces.json',
    imageBaseURL = 'https://uol-library.github.io/spacefinder-ui/assets/photos/',
    spaces,
    currentLoc = {'lat': 52.205575, 'lng': 0.121682},
    spaceProperties = {
        'atmosphere_disciplined': 'Disciplined',
        'atmosphere_relaxed': 'Relaxed',
        'atmosphere_historic': 'Historic',
        'atmosphere_modern': 'Modern',
        'atmosphere_inspiring': 'Inspiring',
        'atmosphere_cosy': 'Cosy',
        'atmosphere_social': 'Social',
        'atmosphere_friendly': 'Friendly',
        'noise_strictlysilent': 'Strictly silent',
        'noise_whispers': 'Whispers',
        'noise_backgroundchatter': 'Background chatter',
        'noise_animateddiscussion': 'Animated discussion',
        'noise_musicplaying': 'Music playing',
        'facility_food_drink': 'Food &amp; drink allowed',
        'facility_daylight': 'Natural daylight',
        'facility_views': 'Attractive views out of the window',
        'facility_large_desks': 'Large desks',
        'facility_free_wifi': 'Free Wifi',
        'facility_no_wifi': 'No WiFi',
        'facility_computers': 'Computers',
        'facility_laptops_allowed': 'Laptops allowed',
        'facility_sockets': 'Plug Sockets',
        'facility_signal': 'Phone signal',
        'facility_printers_copiers': 'Printers and copiers',
        'facility_whiteboards': 'Whiteboards',
        'facility_projector': 'Projector',
        'facility_outdoor_seating': 'Outdoor seating',
        'facility_bookable': 'Bookable',
        'facility_toilets': 'Toilets nearby',
        'facility_refreshments': 'Close to refreshments',
        'facility_break': 'Close to a place to take a break',
        'facility_wheelchair_accessible': 'Wheelchair accessible',
        'facility_blue_badge_parking': 'Parking for blue badge holders',
        'facility_accessible_toilets': 'Toilets accessible to disabled people',
        'acility_induction_loops': 'Induction loops',
        'facility_adjustable_furniture': 'Adjustable furniture',
        'facility_individual_study_space': 'Individual study spaces available',
        'facility_gender_neutral_toilets': 'Gender neutral toilets',
        'facility_bike_racks': 'Bike racks',
        'facility_smoking_area': 'Designated smoking area',
        'facility_baby_changing': 'Baby changing facilities',
        'facility_prayer_room': 'Prayer room'
    };

/* setup */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('spacesloaded', () => {
        renderList();
        lazyLoadSpaceImages( imageBaseURL );
        updateDistances();
    });
    loadSpaces();
});

/**
 * Loads all space data from a single JSON file
 */
function loadSpaces() {
    getJSON( { key: 'spaces', url: spacesurl, callback: data => {
        if ( data.length ) {
            spaces = data;
            console.log(spaces);
            spaces.forEach( (space, index) => {
                spaces[index].link = '#/space/' + space.id;
                spaces[index].classes = getClassList( space );
            });
            /* fire the spacesloaded event */
            document.getElementById('list').dispatchEvent( new Event( 'spacesloaded', {
                bubbles: true,
                cancelable: true,
                composed: false,
            } ) );
        }
    } } );
}

/**
 * Renders list view for spaces
 */
function renderList() {
    let listContainer = document.getElementById('listcontent');
    spaces.forEach( space => {
        spaceContainer = document.createElement('div');
        spaceContainer.setAttribute('data-id', space.id );
        spaceContainer.setAttribute('data-sortkey', space.name.replace( /[^0-9a-zA-Z]/g, '').toLowerCase() );
        spaceContainer.setAttribute('class', 'list-space ' + space.classes );
        let spaceHTML = '<h2><a href="' + space.link + '">' + space.name + '</a></h2>';
        spaceHTML += '<h3><span class="space-type space-type-' + space.space_type.toLowerCase() + '">' + space.space_type + '</span>';
        spaceHTML += space.library? '<span class="library">' + space.library + '</span>': '';
        spaceHTML += '<span class="address">' + space.address + '</span></h3>';
        spaceHTML += '<div class="space-details">';
        if ( space.images.length ) {
            spaceHTML += '<div data-imgsrc="' + space.images[0] + '" class="space-image lazy"></div>';
        }
        spaceHTML += '<div><p class="description">' + space.description + '</p>';
        if ( space.facilities.length ) {
            space.facilities.forEach( f => {
                spaceHTML += '<span class="facility facility_' + f + '" title="' + spaceProperties[ 'facility_' + f ] + '>' + spaceProperties[ 'facility_' + f ] + '</span>';
            });
        }
        spaceHTML += '</div></div>';
        spaceContainer.innerHTML = spaceHTML;
        listContainer.append( spaceContainer );
    });
}

/**
 * Gets a list of classes for a space container to facilitate filtering
 * @param {Object} space Space data
 * @return {String} classList Space separated list of classnames
 */
function getClassList( space ) {
    var classList = '';
    if (space.work.length){
        classList += 'work_'+space.work.join(' work_')+' ';
    }
    if (space.facilities.length){
        classList += 'facility_'+space.facilities.join(' facility_')+' ';
    }
    if (space.atmosphere.length){
        classList += 'atmosphere_'+space.atmosphere.join(' atmosphere_')+' ';
    }
    if (space.noise) {
        classList += 'noise_'+space.noise.replace(/\W/g, '').toLowerCase();
    }
    if (space.type) {
        classList += 'type_'+space.space-type.replace(/\W/g, '').toLowerCase();
    }
    return classList;
}

function updateDistances() {
    spaces.forEach( (space, index) => {
        spaces[index].distancefromcentre = haversine_distance( currentLoc, { lat: space.lat, lng: space.lng } );
        document.querySelector('[data-id="' + space.id + '"]').setAttribute('data-distance', spaces[index].distancefromcentre );
    });
}

/**
 * Lazy loads images (i.e. only retrieves them from their URLs when they are
 * in the viewport). Uses IntersectionObserver API if available, and falls
 * back to listening for scroll events and testing scrollTop/offsetTop.
 * 
 * @param {String} imageBaseURL Base URL of the folder containing all images 
 */
 function lazyLoadSpaceImages( imageBaseURL ) {
    var photosFolder = imageBaseURL;
    var lazyloadImages;

    if ( "IntersectionObserver" in window ) {
        lazyloadImages = document.querySelectorAll( ".lazy" );
        var imageObserver = new IntersectionObserver( function( entries, observer ) {
            entries.forEach( function( entry ) {
                if ( entry.isIntersecting ) {
                    var image = entry.target;
                    image.classList.remove( 'lazy' );
                    image.setAttribute('style', 'background-image:url(' + imageBaseURL + image.getAttribute('data-imgsrc') + ')');
                    imageObserver.unobserve( image );
                }
            });
        });

        lazyloadImages.forEach( function( image ) {
            imageObserver.observe( image );
        });
    } else {  
        var lazyloadThrottleTimeout;
        lazyloadImages = document.querySelectorAll( '.lazy' );

        function lazyload() {
            if ( lazyloadThrottleTimeout ) {
                clearTimeout( lazyloadThrottleTimeout) ;
            }    

            lazyloadThrottleTimeout = setTimeout( function() {
                var scrollTop = window.pageYOffset;
                lazyloadImages.forEach( function( img ) {
                    if ( img.offsetTop < ( window.innerHeight + scrollTop ) ) {
                        img.src = img.dataset.src;
                        img.classList.remove( 'lazy' );
                        image.setAttribute( 'style', 'background-image:url(' + imageBaseURL + image.getAttribute('data-imgsrc') + ')');
                    }
                });
                if ( lazyloadImages.length == 0 ) { 
                    document.removeEventListener( 'scroll', lazyload );
                    window.removeEventListener( 'resize', lazyload );
                    window.removeEventListener( 'orientationChange', lazyload );
                }
            }, 20);
        }

        document.addEventListener( 'scroll', lazyload );
        window.addEventListener( 'resize', lazyload );
        window.addEventListener( 'orientationChange', lazyload );
    }
}
