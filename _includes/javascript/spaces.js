/* setup */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('spacesloaded', () => {
        renderList();
        lazyLoadSpaceImages();
        updateDistances();
        checkOpeningHours();
        activateSort(true, 'alpha');
        sortSpaces( 'sortalpha', true );
        activateSpaces();
    });
    loadSpaces();
    /* event listener for search + filter changes */
    document.addEventListener( 'viewfilter', applyFilters );
    document.addEventListener( 'filtersapplied', updateListFilterMessage );
});

/**
 * Applies filters to the list of spaces
 */
function applyFilters() {
    const activeFilters = getFilterStatus();
    document.getElementById('listcontainer').scrollTop = 0;
    let searchcondition = '';
    if ( activeFilters.length ) {
        activeFilters.forEach( filtergroup => {
            if ( filtergroup.name !== 'search' ) {
                document.dispatchEvent(new CustomEvent('sfanalytics', {
                    detail: {
                        type: 'filter',
                        filtername: filtergroup.name,
                        terms: filtergroup.value.join(', ')
                    }
                }));
            }
        });
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
                } else if ( filtergroup.name == 'open' ) {
                    if ( el.getAttribute('data-openclass') != 'open' ) {
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
    document.dispatchEvent( new Event( 'filtersapplied' ) );
}

/**
 * Updates the message above the list of spaces to show what 
 * search terms and filters are active
 */
function updateListFilterMessage() {
    let activeFilters = getFilterStatus();
    let container = document.getElementById('listfilters');
    /* empty any existing messages and hide */
    container.textContent = '';
    container.setAttribute('hidden', true);
    let searchmessage = filtermessage = resultsmessage = '';
    if ( activeFilters.length ) {
        /* add search and filter messages - buttons will remove filters/terms */
        activeFilters.forEach( f => {
            if ( f.name == 'search' ) {
                let pl = f.value.length > 1 ? 's': '';
                searchmessage = '<p>Searching spaces which contain text: ';
                let termlist = [];
                f.value.forEach( term => {
                    termlist.push('<button class="search-term icon-remove" data-searchtext="' + term + '">' + term + '</button>');
                });
                searchmessage += termlist.join(' or ') + '</p>';
            } else if ( f.name == 'open' ) {
                filtermessage += '<p><button class="filter-term icon-remove" data-termid="open_show_open">Showing spaces which are currently open</button>';
            } else {
                filtermessage += '<p>Filtering spaces by <em>' + f.name + '</em>: ';
                let termlist = [];
                f.value.forEach( term => {
                    termlist.push('<button class="filter-term icon-remove" data-termid="' + f.name + '_' + term + '">'+spacefinder.filters[ f.name + '_' + term ]+'</button>');
                });
                filtermessage += termlist.join(', ') + '</p>';
            }
        });
    }
    /* get count of spaces */
    let spacesShowing = document.querySelectorAll('.list-space').length;
    /* decrease spaces count if some are hidden */
    if (document.querySelectorAll('.list-space.hidden') != null ) {
        spacesShowing = document.querySelectorAll('.list-space').length - document.querySelectorAll('.list-space.hidden').length;
        /* show zero results message */
        if ( spacesShowing == 0 ) {
            resultsmessage = '<p class="noresults">Sorry, your search has found no results - try removing some of your search criteria.</p>';
        }
    }
    /* add filter, search and results messages */
    if ( ( searchmessage + filtermessage + resultsmessage ) != '' ) {
        container.innerHTML = searchmessage + filtermessage + resultsmessage;
        container.removeAttribute('hidden');
    }
    /* update spaces showing count */
    document.getElementById('listshowingcount').textContent = spacesShowing;
}

/**
 * Activates spaces by adding a click listener to the titles, and
 * delegated listeners for terms in the filter / search status bar.
 */
function activateSpaces() {
    /* event listener to display space detail */
    document.querySelectorAll('.space-title').forEach( el => {
        el.addEventListener('click', event => {
            event.preventDefault();
            let spacenode = document.querySelector('[data-id="'+event.target.getAttribute('data-spaceid')+'"]');
            if ( ! spacenode.classList.contains('active') ) {
                selectSpace( event.target.getAttribute('data-spaceid'), 'list' );
            }
        });
    });
    document.querySelectorAll('.list-space .closebutton').forEach( el => {
        el.addEventListener('click', event => {
            deselectSpaces(false);
            window.location.hash = '';
        });
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

/**
 * Selects a space in the list
 * @param {integer} spaceid 
 */
function selectSpace( spaceid, source ) {
    let space = getSpaceById( spaceid );
    window.location.hash = '/space/'+space.slug;
    document.dispatchEvent(new CustomEvent('sfanalytics', {
        detail: {
            type: 'select',
            id: spaceid,
            name: space.title,
            src: source
        }
    }));
    renderAdditionalInfo( space.id );
    zoomMapToSpace( space );
    let spacenode = document.querySelector('[data-id="'+spaceid+'"]');
    document.querySelectorAll('.list-space').forEach( sp => {
        sp.classList.remove('active');
    });
    spacenode.classList.add('active');
    /* find distance from top of listcontainer */
    let scrollingElement = document.getElementById('listcontainer');
    let listContainer = document.getElementById('listcontent');
    let totop = spacenode.offsetTop - listContainer.offsetTop;
    /* scroll into view */
    if ( scrollingElement.scrollTo ) {
        scrollingElement.scrollTo({top: totop, left: 0, behavior: 'smooth'});
    } else {
        scrollingElement.scrollTop = totop;
    }
    spacenode.querySelector( 'h2' ).focus();
}

/**
 * Deselects a space in the list, an optionally scrolls the list to the top
 * @param {boolean} scrollReset 
 */
function deselectSpaces( scrollReset ) {
    if ( spacefinder.infoWindow ) {
        spacefinder.infoWindow.close();
    }
    document.querySelectorAll('.additionalInfo').forEach( el => {
        el.textContent = '';
    });
    document.querySelectorAll('.list-space').forEach( sp => {
        sp.classList.remove('active');
    });
    if ( scrollReset ) {
        document.getElementById('listcontainer').scrollTop = 0;
    }
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
        sortbutton.removeEventListener('click', sortSpacesListener);
    } else {
        sortbutton.disabled = false;
        sortbutton.addEventListener('click', sortSpacesListener);
        //sortbutton.dispatchEvent(new Event('click'));
    }
}
/**
 * Function used as an event listener on the sorting buttons
 * @param {Event} e event from button click
 */
function sortSpacesListener( e ) {
    e.preventDefault();
    /* get all the data we need to perform the sort */
    let sortdir = e.target.getAttribute('data-sortdir');
    let sortby = e.target.getAttribute('id');
    /* determine direction from current attribute value */
    let dir = ( sortdir == 'desc' || sortdir == '' ) ? true: false;
    /* perform the sort */
    sortSpaces( sortby, dir );
}

/**
 * Function to sort spaces. Sorts using data attributes on 
 * space containers (sortalpha, sortdistance)
 * @param {string} sortby property we are using to sort the list (needs to be part of a data attribute)
 * @param {boolean} dir sort direction (true = asc, false = desc)
 */
function sortSpaces( sortby, dir ) {
    /* first update the sorting buttons */
    document.querySelectorAll( '.sortbutton' ).forEach( el => el.setAttribute( 'data-sortdir', '' ) );
    let dirAttr = dir ? 'asc': 'desc';
    document.getElementById( sortby ).setAttribute( 'data-sortdir', dirAttr );
    /* get all the things we need to perform the sort */
    let listcontainer = document.getElementById( 'listcontent' );
    let listitems = document.querySelectorAll( '#listcontent>div' );
    /* sort the list items */
    let listitemsArray = Array.prototype.slice.call(listitems).sort( comparer( dir, 'data-'+sortby ) );
    /* add back to the DOM */
    listitemsArray.forEach( el => {
        listcontainer.appendChild( el );
    });
    deselectSpaces(true);
    listcontainer.querySelector( 'h2' ).focus();
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
        let aval = asc ? a.getAttribute( attr ): b.getAttribute( attr );
        let bval = asc ? b.getAttribute( attr ): a.getAttribute( attr );
        return function( v1, v2 ) {
            return v1 !== '' && v2 !== '' && ! isNaN( v1 ) && ! isNaN( v2 ) ? v1 - v2 : v1.toString().localeCompare( v2 );
        }( aval, bval );
    };
};

/**
 * Loads all space data from a single JSON file
 */
function loadSpaces() {
    getJSON( { key: 'spaces', url: spacefinder.spacesurl, debug: false, callback: data => {
        if ( data.length ) {
            data.forEach( (space, index) => {
                spacefinder.spaces[index] = space;
                spacefinder.spaces[index].link = '#/space/' + space.slug;
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
        spaceContainer.setAttribute('class', space.classes );
        let spaceHTML = '<h2><a href="' + space.link + '" class="space-title" aria-controls="additionalInfo' + space.id + '" data-spaceid="' + space.id + '">' + space.title + '</a><button class="closebutton icon-close"><span class="visuallyhidden">Close</span></button></h2>';
        spaceHTML += '<p class="info"><span class="space-type space-type-' + space.space_type.replace( /[^0-9a-zA-Z]/g, '').toLowerCase() + '">' + space.space_type + '</span>';
        spaceHTML += '<span class="distance">(1,353 metres)</span>';
        let loc = '';
        if ( space.floor !== "" ) {
            loc += '<span class="address-floor">' + space.floor + '</span>, ';
        }
        if ( space.building !== "" ) {
            loc += '<span class="address-building">' + space.building + '</span>, ';
        }
        if ( space.address !== "" ) {
            loc += '<span class="address-location">' + space.address + '</span>';
        }
        spaceHTML += '<span class="address">' + loc + '</span></p>';
        spaceHTML += '<div class="space-details">';
        if ( space.image != '' ) {
            spaceHTML += '<div data-imgsrc="' + space.image + '" class="space-image lazy" role="img" aria-label="' + space.imagealt + '"></div>';
        }
        spaceHTML += '<div><p class="description">' + space.description + '</p></div>';
        spaceHTML += '<div class="additionalInfo" aria-live="polite" id="additionalInfo' + space.id + '"></div>';
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
    if ( spaceid !== false ) {
        /* get space data */
        let space = getSpaceById( spaceid );
        let spacenode = getSpaceNodeById( spaceid );
        let spaceHTML = '';
        if ( space.booking_url ) {
            spaceHTML += '<p><a class="button" href="'+space.booking_url+'">Book a space</a></p>';
        }
        spaceHTML += '<section class="section-facts"><h3>Key Facts</h3><ul class="bulleticons">';
        let loc = '';
        if ( space.floor !== "" ) {
            loc += space.floor + ', ';
        }
        if ( space.building !== "" ) {
            loc += space.building + ', ';
        }
        if ( space.address !== "" ) {
            loc += space.address;
        }
        loc += ' (<a target="googlemaps" href="https://www.google.com/maps/dir/?api=1&amp;destination='+space.lat+'%2c' + space.lng + '&amp;travelmode=walking">get directions</a>)';
        spaceHTML += '<li class="icon-marker">'+loc+'</li>';
        if ( space.url != "" ) {
            spaceHTML += '<li class="icon-link"><a href="'+space.url+'">'+space.url+'</a></li>';
        }
        if ( space.campusmap_url != "" ) {
            let campusmap_ref = space.campusmap_ref !== "" ? " (map reference "+space.campusmap_ref+")": "";
            spaceHTML += '<li class="icon-uol-logo-mark"><a target="campusmap" href="'+space.campusmap_url+'">View on campus map</a>' + campusmap_ref + '<li>';
        }
        spaceHTML += '<li class="icon-access">Open to '+space.access+'<li>';
        spaceHTML += '</ul></section>';

        spaceHTML += '<section class="section-opening"><h3>Opening Times</h3>';
        spaceHTML += '<p class="icon-time-short" data-openmsg-id="' + space.id + '">' + spacenode.getAttribute('data-openmsg') + '</p>';
        spaceHTML += '<ul class="opening-times">';
        ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].forEach( (day, idx) => {
            let today = new Date().getDay();
            let todayidx = ( ( idx + 1 ) < 7 ) ? ( idx + 1 ): 0;
            let istodayclass = ( todayidx === today ) ? ' class="today"': '';
            if ( space.opening_hours[day].open ) {
                spaceHTML += '<li'+istodayclass+'><span class="dayname">'+ day.charAt(0).toUpperCase() + day.slice(1) + '</span> <span class="opening">' + space.opening_hours[day].from + ' - ' + space.opening_hours[day].to +'</span></li>';
            } else {
                spaceHTML += '<li'+istodayclass+'><span class="dayname">'+ day.charAt(0).toUpperCase() + day.slice(1) + '</span> <span class="opening">Closed</span></li>';
            }
        });
        spaceHTML += '</ul></section>';
        if ( space.phone_number !== "" || space.twitter_screen_name !== "" || space.facebook_url !== "" ) {
            spaceHTML += '<section class="section-facts"><h3>Contact</h3><ul class="bulleticons">';
            if ( space.phone_number !== "" ) {
                let phoneattr = space.phone_number.replace(/[^0-9]+/g, '').replace(/^0/, '+44');
                spaceHTML += '<li class="icon-phone"><a href="tel:'+phoneattr+'">'+space.phone_number+'</a></li>';
            }
            if ( space.twitter_screen_name !== "" ) {
                spaceHTML += '<li class="icon-twitter"><a href="https://twitter.com/'+space.twitter_screen_name+'">'+space.twitter_screen_name+'</a></li>';
            }
            if ( space.facebook_url !== "" ) {
                spaceHTML += '<li class="icon-facebook"><a href="'+space.facebook_url+'">'+space.facebook_url+'</a></li>';
            }
        }

        if ( space.facilities.length ) {
            spaceHTML += '<section class="section-facilities"><h3>Facilities</h3><ul class="bulleticons">';
            for ( i = 0; i < space.facilities.length; i++ ) {
                spaceHTML += '<li class="' + spacefinder.icons[space.facilities[i]] + '">' + spacefinder.filters[ 'facility_' + space.facilities[i] ] + '</li>';
            }
            spaceHTML += '</ul></section>';
        }
        spacenode.querySelector('.additionalInfo').innerHTML = spaceHTML;
        spacenode.querySelector( 'h2' ).focus();
    }
}
/**
 * Gets a list of classes for a space container to facilitate filtering
 * @param {Object} space Space data
 * @return {String} classList Space separated list of classnames
 */
function getClassList( space ) {
    var classList = 'list-space ';
    if ( space.space_type ) {
        classList += 'type_' + space.space_type.replace( /[^0-9a-zA-Z]/g, '').toLowerCase() + ' ';
    }
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
    return classList;
}

/**
 * Checks each space to see if it currently open and sets data-opennow attribute
 * Also adds class to the row in the opening times table.
 */
function checkOpeningHours() {
    let today = new Date();
    let daynames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    let todaysday = daynames[ today.getDay() ];
    let timenow = ( today.getHours() * 100 ) + today.getMinutes();
    spacefinder.spaces.forEach( (space, index) => {
        let openmsg = '';
        let openclass = 'currently-closed';
        let currentClass = document.querySelector('[data-id="' + space.id + '"]').getAttribute( 'data-openclass' );
        if ( space.opening_hours ) {
            if ( space.opening_hours[todaysday].open ) {
                let open_from = getTimeFromString( space.opening_hours[todaysday].from );
                let open_to = getTimeFromString( space.opening_hours[todaysday].to );
                if ( open_from > timenow ) {
                    let openingin = '';
                    let openinmins = ( open_from - timenow ) % 60;
                    let openinhrs = Math.floor( ( ( open_from - timenow ) / 60 ) );
                    let pl = '';
                    if ( openinhrs > 0 ) {
                        pl = ( openinhrs == 1 )? '': 's';
                        openingin += openinhrs + 'hr' + pl + ' ';
                    }
                    pl = ( openinmins == 1 ) ? '': 's';
                    if ( openinmins > 0 ) {
                        openingin += openinmins + 'min' + pl;
                    }
                    openmsg = "Currently closed (opens in "+openingin+")";
                    openclass = 'opening-later';
                } else if ( open_to < timenow ) {
                    openclass = 'closed';
                    openmsg = "Currently closed";
                } else {
                    openclass = 'open';
                    openmsg = "Currently open";
                }
            } else {
                openmsg = "Closed all day";
            }
        }
        document.querySelector('[data-id="' + space.id + '"]').setAttribute('data-openmsg', openmsg );
        document.querySelector('[data-id="' + space.id + '"]').setAttribute('data-openclass', openclass );
        /* change message in any spaces showing additional info */
        if ( document.querySelector('[data-openmsg-id="' + space.id + '"]') != null ) {
            document.querySelector('[data-openmsg-id="' + space.id + '"]').textContent = openmsg;
            document.querySelector('[data-openmsg-id="' + space.id + '"]').classList.remove(currentClass);
            document.querySelector('[data-openmsg-id="' + space.id + '"]').classList.add(openclass);
            
        }
    });
    // call every 30 seconds
    setInterval( checkOpeningHours, (30*1000) );
}
function getTimeFromString( str ) {
    let parts = str.split(':');
    return ( parseInt( parts[0] ) * 100 ) + parseInt( parts[1] );
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
