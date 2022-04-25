/* setup */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('spacesloaded', () => {
        renderList();
        lazyLoadSpaceImages();
        updateDistances();
        activateSort(true, 'alpha');
        activateSpaces();
    });
    loadSpaces();
    /* event listener for search + filter changes */
    document.addEventListener('viewfilter', event => {
        const activeFilters = getFilterStatus();
        document.getElementById('listcontent').scrollTop = 0;
        let searchcondition = '';
        if ( activeFilters.length ) {
            document.querySelectorAll('.list-space').forEach( el => {
                el.classList.remove('hidden');
                let showEl = true;
                activeFilters.forEach( filtergroup => {
                    if ( filtergroup.name == 'search' ) {
                        let foundKw = false;
                        filtergroup.value.forEach( term => {
                            if ( el.textContent.toLowerCase().indexOf( term.toLowerCase() ) != -1 ) {
                                foundKw = true;
                            }
                        });
                        if ( ! foundKw ) {
                            showEl = false;
                        }
                    } else {
                        let regex = filtergroup.name+'_('+filtergroup.value.join('|')+')';
                        if ( ! el.className.match(regex) ) {
                            showEl = false;
                        }
                    }
                });
                if ( ! showEl ) {
                    el.classList.add('hidden');
                }
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
        updateListFilterMessage(activeFilters);
    });
});

/**
 * Updates the message above the list of spaces to show what 
 * search terms and filters are active
 */
function updateListFilterMessage( filters ) {
    let container = document.getElementById('listfilters');
    /* empty any existing messages and hide */
    container.textContent = '';
    container.setAttribute('hidden', true);
    let searchmessage = filtermessage = resultsmessage = '';
    if ( filters.length ) {
        filters.forEach( f => {
            if ( f.name == 'search' ) {
                let pl = f.value.length > 1 ? 's': '';
                searchmessage = '<p>Searching spaces which contain text: ';
                let termlist = [];
                f.value.forEach( term => {
                    termlist.push('<button class="search-term icon-remove" data-searchtext="' + term + '">' + term + '</button>');
                });
                searchmessage += termlist.join(' or ') + '</p>';
            } else {
                let pl = f.value.length > 1 ? 's': '';
                filtermessage += '<p>Filtering spaces by <em>' + f.name + '</em> term' + pl + ': ';
                let termlist = [];
                f.value.forEach( term => {
                    termlist.push('<button class="filter-term icon-remove" data-termid="' + f.name + '_' + term + '">'+spacefinder.spaceProperties[ f.name + '_' + term ]+'</button>');
                });
                filtermessage += termlist.join(', ') + '</p>';
            }
        });
        if (document.querySelectorAll('.list-space.hidden') != null ) {
            let spacesShowing = document.querySelectorAll('.list-space').length - document.querySelectorAll('.list-space.hidden').length;
            if ( spacesShowing == 0 ) {
                resultsmessage = '<p class="noresults">Sorry, your search has found no results - try removing some of your search criteria.</p>';
            }
        }
        container.innerHTML = searchmessage + filtermessage + resultsmessage;
        container.removeAttribute('hidden');
    }
}

function activateSpaces() {
    /* event listener to display space detail */
    document.querySelectorAll('.space-title').forEach( el => {
        el.addEventListener('click', event => {
            highlightSpace( event.target.getAttribute('data-spaceid') );
            //let spaceNode = event.target.parentNode.parentNode.cloneNode(true);
            //console.log(spaceNode);
        });
        el.addEventListener('focus', highlightSpaceInMap );
        el.addEventListener('blur', highlightSpaceInMap );
        el.addEventListener('mouseover', highlightSpaceInMap );
        el.addEventListener('mouseout', highlightSpaceInMap );
    });
    /* add listener to buttons in filter and search status bar */
    document.addEventListener('click', e => {
        if ( e.target.matches('.search-term') ) {
            e.preventDefault();
            let searchtext = e.target.getAttribute('data-searchtext');
            let searchinput = document.getElementById('search-input').value.trim();
            let searchterms = searchinput.split(' ');
            let newsearchterms = [];
            searchterms.forEach( term => {
                if ( term != searchtext ) {
                    newsearchterms.push( term );
                }
            });
            document.getElementById('search-input').value = newsearchterms.join(' ');
            document.dispatchEvent(spacefinder.filterEvent);
        }
        if ( e.target.matches('.filter-term') ) {
            e.preventDefault();
            let termid = e.target.getAttribute('data-termid');
            document.getElementById(termid).checked = false;
            document.dispatchEvent(spacefinder.filterEvent);
        }
    });
    
}
function highlightSpace( spaceid ) {
    let space = getSpaceById( spaceid );
    renderAdditionalInfo( space.id );
    zoomMapToSpace( space );
    let spacenode = document.querySelector('[data-id="'+spaceid+'"]');
    document.querySelectorAll('.list-space').forEach( sp => {
        sp.classList.remove('active');
    });
    spacenode.classList.add('active');
    spacenode.scrollIntoView({behavior: "smooth"});
}

function getSpaceById( id ) {
    for (let i = 0; i < spacefinder.spaces.length; i++ ) {
        if ( spacefinder.spaces[i].id == id ) {
            return spacefinder.spaces[i];
        }
    }
}
function getSpaceNodeById( id ) {
    return document.querySelector('[data-id="'+id+'"]');
}
function highlightSpaceInMap( e ) {
    let spacenode = e.target;
}

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
        sortbutton.dispatchEvent(new Event('click'));
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
        let spaceHTML = '<h2><a href="' + space.link + '" class="space-title" data-spaceid="' + space.id + '">' + space.title + '</a></h2>';
        spaceHTML += '<h3><span class="space-type space-type-' + space.space_type.toLowerCase() + '">' + space.space_type + '</span>';
        spaceHTML += '<span class="address">' + space.address + '</span></h3>';
        spaceHTML += '<div class="space-details">';
        if ( space.images.length ) {
            spaceHTML += '<div data-imgsrc="' + space.images[0] + '" class="space-image lazy"></div>';
        }
        spaceHTML += '<div><p class="description">' + space.description + '</p></div>';
        spaceHTML += '<div class="additionalInfo"></div>';
        spaceHTML += '</div>';
        spaceContainer.innerHTML = spaceHTML;
        listContainer.append( spaceContainer );
    });
    document.getElementById('listshowingcount').textContent = spacetotal;
    document.getElementById('listtotalcount').textContent = spacetotal;
}
/**
 * Renders additional information about a space.
 * The main listing only contains a minimal amount of information about spaces - 
 * when a space is clicked on, this is augmented by additional data.
 * @param {integer} spaceid ID of space
 */
function renderAdditionalInfo( spaceid ) {
    /* clear any additional data currently displayed */
    document.querySelectorAll('.additionalInfo').forEach( el => {
        el.textContent = '';
    });
    /* get space data */
    let space = getSpaceById( spaceid );
    let spaceHTML = '';
    if ( space.booking_url ) {

    }
    spaceHTML += '<section class="section-facts"><h4>Key Facts</h4><ul class="bulleticons">';
    spaceHTML += '<li class="icon-marker"><span>'+space.address+'</span><li>';
    if ( space.url != "" ) {
        spaceHTML += '<li class="icon-link"><a href="'+space.url+'">'+space.url+'</a></li>';
    }
    if ( space.campusmap_url != "" ) {
        spaceHTML += '<li class="icon-link"><a href="'+space.campusmap_url+'">'+space.campusmap_url+'</a><li>';
    }
    spaceHTML += '<li class="icon-access">Open to '+space.access+'<li>';
    spaceHTML += '</ul></section>';

    //spaceHTML += '<section class="section-opening"><h4>Opening Times</h4>';
    //spaceHTML += '</ul></section>';

    if ( space.facilities.length ) {
        spaceHTML += '<section class="section-facilities"><h4>Facilities</h4><ul>';
        for ( i = 0; i < space.facilities.length; i++ ) {
            spaceHTML += '<li><span class="facility facility_' + space.facilities[i] + '" title="' + spacefinder.spaceProperties[ 'facility_' + space.facilities[i] ] + '">' + spacefinder.spaceProperties[ 'facility_' + space.facilities[i] ] + '</span></li>';
        }
        spaceHTML += '</ul></section>';
    }
    getSpaceNodeById( spaceid ).querySelector('.additionalInfo').innerHTML = spaceHTML;
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
