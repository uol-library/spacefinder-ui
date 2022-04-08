/* setup */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('spacesloaded', () => {
        renderList();
        lazyLoadSpaceImages();
        updateDistances();
        activateSort(true, 'alpha');
    });
    loadSpaces();
    /* event listener for filter changes */
    document.addEventListener('viewfilter', event => {
        const activeFilters = getFilterStatus();
        console.log(activeFilters);
        if ( activeFilters.length ) {
            document.querySelectorAll('.list-space').forEach( el => {
                el.classList.remove('hidden');
                activeFilters.forEach( filtergroup => {
                    let regex = filtergroup.name+'_('+filtergroup.value.join('|')+')';
                    if ( ! el.className.match(regex) ) {
                        el.classList.add('hidden');
                    }
                });
            });
        } else {
            document.querySelectorAll('.list-space').forEach( el => {
                el.classList.remove('hidden');
            });
        }
        if (document.querySelectorAll('.list-space.hidden') != null ) {
            let spacesShowing = document.querySelectorAll('.list-space').length - document.querySelectorAll('.list-space.hidden').length;
            document.getElementById('listshowingcount').textContent = spacesShowing;
        }
    });
    
});

/**
 * Activates sorting the list of spaces in the UI.
 * @param {boolean} activate whether to activate of deactivate sorting.
 * @param {string} sorttype either alpha or distance.
 */
function activateSort( activate, sorttype ) {
    const sortbutton = document.getElementById( 'sort'+sorttype );
    if ( ! activate ) {
        sortbutton.disabled = true;
        sortbutton.removeEventListener('click', sortSpaces);
    } else {
        sortbutton.disabled = false;
        sortbutton.addEventListener('click', sortSpaces);
    }
}

/**
 * Function to sort spaces. Sorts using data attributes on 
 * space containers (sortalpha, sortdistance)
 * @param {Event} e event from button click
 */
function sortSpaces(e) {
    e.preventDefault();
    /* get all the things we need to perform the sort */
    const sortdir = e.target.getAttribute('data-sortdir'),
        sortby = e.target.getAttribute('id'),
        listcontainer = document.getElementById('listcontent'),
        listitems = document.querySelectorAll('#listcontent>div');
    /* determine direction from current attribute value */
    let dir = ( sortdir == 'desc' || sortdir == '' ) ? true: false;
    /* update direction on attribute */
    e.target.setAttribute('data-sortdir', (dir ? 'asc': 'desc' ) );
    /* update arrow on button label */
    let dirarrow = dir ? '&uarr;': '&darr;';
    document.getElementById(sortby+'dir').innerHTML = dirarrow;
    /* sort the list items */
    let listitemsArray = Array.prototype.slice.call(listitems).sort( comparer( dir, 'data-'+sortby ) );
    /* add back to the DOM */
    listitemsArray.forEach( el => {
        listcontainer.appendChild( el );
    })
}
/**
 * Comparer function
 * @param {boolean} asc ascending or decending sort mode
 * @param {string} attr attribute name for sort key
 * @returns sorting function for Array.sort()
 */
 function comparer( asc, attr ) {
    /**
     * the function to perform the comparison
     * @param {(integer|string)} a first value to sort
     * @param {(integer|string)} b second value to sort
     * @returns {integer} -1, 0 or 1
     */
    return function (a, b) {
        /**
         * Main comparison function. Uses isNaN to distinguish between
         * numeric and alphabetic sorting modes, and localeCompare() to
         * compare strings. 
         * switches between asc / desc ordering
         * @param {(integer|string)} v1 first value to sort
         * @param {(integer|string)} v2 second value to sort
         */
        let aval = asc ? a.getAttribute(attr): b.getAttribute(attr);
        let bval = asc ? b.getAttribute(attr): a.getAttribute(attr);
        return function( v1, v2 ) {
            return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2);
        }( aval, bval );
    };
};
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
    let spacetotal = 0;
    spacefinder.spaces.forEach( space => {
        spacetotal++;
        spaceContainer = document.createElement('div');
        spaceContainer.setAttribute('data-id', space.id );
        spaceContainer.setAttribute('data-sortalpha', space.title.replace( /[^0-9a-zA-Z]/g, '').toLowerCase() );
        spaceContainer.setAttribute('class', 'list-space ' + space.classes );
        let spaceHTML = '<h2><a href="' + space.link + '">' + space.title + '</a></h2>';
        spaceHTML += '<h3><span class="space-type space-type-' + space.space_type.toLowerCase() + '">' + space.space_type + '</span>';
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
    document.getElementById('listshowingcount').textContent = spacetotal;
    document.getElementById('listtotalcount').textContent = spacetotal;
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
        document.querySelector('[data-id="' + space.id + '"]').setAttribute('data-sortdistance', spacefinder.spaces[index].distancefromcentre );
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
