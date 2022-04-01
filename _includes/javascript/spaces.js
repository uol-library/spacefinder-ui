
/* setup */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('spacesloaded', () => {
        renderList();
        lazyLoadSpaceImages();
        updateDistances();
    });
    loadSpaces();
});

/**
 * Loads all space data from a single JSON file
 */
function loadSpaces() {
    getJSON( { key: 'spaces', url: spacefinder.spacesurl, callback: data => {
        if ( data.length ) {
            data.forEach( (space, index) => {
                spacefinder.spaces[index] = space;
                spacefinder.spaces[index].link = '#/space/' + space.id;
                spacefinder.spaces[index].classes = getClassList( space );
            });
            spacefinder.spacesLoaded = true;
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
    spacefinder.spaces.forEach( space => {
        spaceContainer = document.createElement('div');
        spaceContainer.setAttribute('data-id', space.id );
        spaceContainer.setAttribute('data-sortkey', space.title.replace( /[^0-9a-zA-Z]/g, '').toLowerCase() );
        spaceContainer.setAttribute('class', 'list-space ' + space.classes );
        let spaceHTML = '<h2><a href="' + space.link + '">' + space.title + '</a></h2>';
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
                spaceHTML += '<span class="facility facility_' + f + '" title="' + spacefinder.spaceProperties[ 'facility_' + f ] + '>' + spacefinder.spaceProperties[ 'facility_' + f ] + '</span>';
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
    spacefinder.spaces.forEach( (space, index) => {
        spacefinder.spaces[index].distancefromcentre = haversine_distance( spacefinder.currentLoc, { lat: space.lat, lng: space.lng } );
        document.querySelector('[data-id="' + space.id + '"]').setAttribute('data-distance', spacefinder.spaces[index].distancefromcentre );
    });
}

/**
 * Lazy loads images (i.e. only retrieves them from their URLs when they are
 * in the viewport). Uses IntersectionObserver API if available, and falls
 * back to listening for scroll events and testing scrollTop/offsetTop.
 */
 function lazyLoadSpaceImages() {
    var lazyloadImages, lazyloadThrottleTimeout;

    if ( "IntersectionObserver" in window ) {
        lazyloadImages = document.querySelectorAll( ".lazy" );
        const imageObserver = new IntersectionObserver( function( entries, observer ) {
            entries.forEach( function( entry ) {
                if ( entry.isIntersecting ) {
                    var image = entry.target;
                    image.classList.remove( 'lazy' );
                    image.setAttribute('style', 'background-image:url(' + spacefinder.imageBaseURL + image.getAttribute('data-imgsrc') + ')');
                    imageObserver.unobserve( image );
                }
            });
        });

        lazyloadImages.forEach( function( image ) {
            imageObserver.observe( image );
        });
    } else {
        lazyloadImages = document.querySelectorAll( '.lazy' );

        function lazyload() {
            if ( lazyloadThrottleTimeout ) {
                clearTimeout( lazyloadThrottleTimeout) ;
            }    

            lazyloadThrottleTimeout = setTimeout( function() {
                lazyloadImages.forEach( function( img ) {
                    if ( img.offsetTop < ( window.innerHeight + window.pageYOffset ) ) {
                        img.src = img.dataset.src;
                        img.classList.remove( 'lazy' );
                        image.setAttribute( 'style', 'background-image:url(' + spacefinder.imageBaseURL + image.getAttribute('data-imgsrc') + ')');
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
