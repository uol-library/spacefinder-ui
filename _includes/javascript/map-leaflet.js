/**
 * Leaflet.js functions for spacefinder
 */
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

/**
 * Initialise map and set listeners to set up markers when loaded
 */
function initMap() {
    splog( 'initMap', 'map-leaflet.js' );
    document.addEventListener( 'sfmaploaded', checkGeo );
    document.addEventListener( 'filtersapplied', filterMarkers );
    document.addEventListener( 'spacesloaded', maybeSetupMap );
    document.addEventListener( 'sfmaploaded', maybeSetupMap );
    document.addEventListener( 'viewchange', () => {
        console.log('veiw changed');
        spacefinder.map.invalidateSize({animate:false});
    });
    spacefinder.map = L.map('map').setView([spacefinder.currentLoc.lat, spacefinder.currentLoc.lng], spacefinder.startZoom );
    spacefinder.osm = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a target="attribution" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo( spacefinder.map );
    spacefinder.mapLoaded = true;
    document.dispatchEvent( new Event( 'sfmaploaded' ) );
    /**
     * Returns to list view from map "more info" button
     */
    document.addEventListener( 'click', event => {
        if ( event.target.classList.contains('show-list') ) {
            event.preventDefault();
            document.dispatchEvent( new CustomEvent( 'viewchange', {
                bubbles: true,
                cancelable: true,
                composed: false,
                detail: {
                    view: 'list'
                }
            } ) );
        }
    });
}

/**
 * Sets up te map with markers for each space. Needs to run when
 * the map is fully loaded and the space data is fully loaded.
 */
function maybeSetupMap() {
    splog( 'maybeSetupMap', 'map-leaflet.js' );
    if ( spacefinder.mapLoaded && spacefinder.spacesLoaded ) {
        let pointsArray = [];
        /* add each spoace to the map using a marker */
        for ( let i = 0; i < spacefinder.spaces.length; i++ ) {
            if ( spacefinder.spaces[i].lat && spacefinder.spaces[i].lng ) {
                var spacePosition = L.latLng( spacefinder.spaces[i].lat, spacefinder.spaces[i].lng );
                pointsArray.push( [ spacefinder.spaces[i].lat, spacefinder.spaces[i].lng ] );
                spacefinder.spaces[i].marker = L.marker( spacePosition, {
                    alt: spacefinder.spaces[i].title,
                    icon: getSVGIcon( 'space-marker' )
                }).addTo( spacefinder.map );
                spacefinder.spaces[i].popup = L.popup().setContent( getSpaceInfoWindowContent( spacefinder.spaces[i] ) );
                spacefinder.spaces[i].popup.spaceID = spacefinder.spaces[i].id;
                spacefinder.spaces[i].marker.bindPopup( spacefinder.spaces[i].popup );
            }
        }
        spacefinder.map.on( 'popupopen', e => {
            selectSpace( e.popup.spaceID, 'map' );
        });
        spacefinder.map.on('popupclose', function(e){
            deselectSpaces(false);
        });
        spacefinder.map.fitBounds( pointsArray );
        spacefinder.mapBounds = spacefinder.map.getBounds();
        document.dispatchEvent( new Event( 'sfmapready' ) );
    }
}

/**
 * Returns HTML for an individual space's infoWindow 
 * @param {Object} space 
 * @returns {String} HTML content for space infoWindow
 */
function getSpaceInfoWindowContent( space ) {
    return '<div class="spaceInfoWindow"><h3>'+space.title+'</h3><p>'+space.description+'</p><button class="show-list">More info&hellip;</button></div>';
}

/**
 * Returns an object to be used in the map to make a leaflet icon
 * @param {String} className CSS class to be used on the icon
 * @return {Object}
 */
function getSVGIcon( c ) {
	return L.divIcon({
  		html: `<svg width="32" height="32" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" stroke-width="6"></circle></svg>`,
		className: c,
  		iconSize: [32, 32],
  		iconAnchor: [16, 16]
	});
}


function recentreMap() {
    splog( 'recentreMap', 'map.js' );
    let newCenter = geolocationActive() ? spacefinder.personLoc: spacefinder.currentLoc;
    spacefinder.map.panTo( newCenter );
    spacefinder.map.fitBounds( spacefinder.mapBounds );
}
/**
 * Zooms the map to show a particular space
 * @param {Object} space
 */
function zoomMapToSpace( space ) {
    splog( 'zoomMapToSpace', 'map.js' );
    let newCenter = L.latLng( space.lat, space.lng );
    spacefinder.map.setZoom(18);
    space.popup.setLatLng( newCenter ).openOn( spacefinder.map );
    spacefinder.map.panTo( newCenter );

}

/**
 * Filters the markers on the map
 */
function filterMarkers() {
    splog( 'filterMarkers', 'map.js' );
    document.querySelectorAll('.list-space').forEach( el => {
        let space = getSpaceById( el.getAttribute('data-id') );
        if ( el.classList.contains('hidden') ) {
            space.marker.removeFrom( spacefinder.map );
        } else {
            space.marker.addTo( spacefinder.map );
        }
    });
}

/*******************************************************************
 * GEOLOCATION
 *******************************************************************/

/**
 * Toggle the disabled attribute of the geolocation control
 * @param {boolean} enable which way to toggle
 */
function toggleGeolocation( enable ) {
    splog( 'toggleGeolocation', 'map.js' );
    if ( enable ) {
        document.querySelectorAll( '.geo-button' ).forEach( e => e.disabled = false );
    } else {
        document.querySelectorAll( '.geo-button' ).forEach( e => e.disabled = true );
    }
}

/**
 * Toggle the active class of the geolocation control.
 * Also adds/removes the event listener to update the user's position
 * and adds / removes the person marker.
 * @param {boolean} activate which way to toggle
 */
function activateGeolocation( activate ) {
    splog( 'activateGeolocation', 'map.js' );
    if ( activate ) {
        document.querySelectorAll( '.geo-button' ).forEach( e => {
            e.classList.add('active');
            e.setAttribute('aria-label','Stop using my location')
            e.setAttribute('title','Stop using my location')
        });
        document.addEventListener( 'userlocationchanged', movePersonMarker );
        document.dispatchEvent(new CustomEvent('sfanalytics', {
            detail: {
                type: 'geostart'
            }
        }));
    } else {
        document.querySelectorAll( '.geo-button' ).forEach( e => {
            e.classList.remove('active');
            e.setAttribute('aria-label','Use my location')
            e.setAttribute('title','Use my location')
        });
        document.removeEventListener( 'userlocationchanged', movePersonMarker );
        /* remove sorting indicator from all buttons */
        document.getElementById( 'sortdistance' ).setAttribute('data-sortdir', '');
        document.dispatchEvent(new CustomEvent('sfanalytics', {
            detail: {
                type: 'geoend'
            }
        }));
    }
    updateDistances();
    activateSort( activate, 'distance' );
}

/**
 * Moves the person marker to the user's position and centres the 
 * map on that position. The property spacefinder.personLoc is used
 * for the user position - this is updated in the geolocation.watchPosition
 * event listener. In addition to moving the person marker, distances
 * from the person to each space are updated, and if spaces are sorted
 * by distance, the sort order is updated.
 * @see getUserPosition()
 */
function movePersonMarker() {
    splog( 'movePersonMarker', 'map.js' );
    /* move person marker */
    if ( spacefinder.personMarker ) {
        spacefinder.personMarker.setPosition( spacefinder.personLoc );
    }
    /* update distances to each space */
    updateDistances();
    /* see if the spaces are sorted by distance */
    let btn = document.querySelector('#sortdistance[data-sortdir$="sc"');
    if ( btn !== null ) {
        /* determine direction from current attribute value */
        let sortdir = document.getElementById('sortdistance').getAttribute('data-sortdir');
        let dir = ( sortdir == 'desc' ) ? false: true;
        /* re-sort spaces */
        sortSpaces( 'sortdistance', dir );
    }
    /* centre the map on the person */
    spacefinder.map.panTo( spacefinder.personLoc );
}

/**
 * Test to see if geolocation services are enabled
 * @returns {boolean}
 */
function geolocationEnabled() {
    splog( 'geolocationEnabled', 'map.js' );
    const btn = document.querySelector( '.geo-button' );
    if ( btn !== null ) {
        return btn.disabled == false;
    }
    return false;
}

/**
 * Test to see if geolocation services are active
 * @returns {boolean}
 */
function geolocationActive() {
    splog( 'geolocationActive', 'map.js' );
    return ( document.querySelector( '.geo-button.active' ) !== null ? true: false );
}

/**
 * Performs checks for geolocation permissions and services when the map has loaded
 */
function checkGeo() {
    splog( 'checkGeo', 'map.js' );
    /* first see if geolocation is available on the device */
    checkGeoAvailable();
    /* check to see if it is enabled to determine initial button states */
    checkGeoPermissions();
}

/**
 * Checks permissions to see if geolocation services are permitted.
 * If they have been denied, geolocation is disabled. Also
 * watches for updates to permissions.
 */
function checkGeoPermissions() {
    splog( 'checkGeoPermissions', 'map.js' );
    /* check for permissions query */
    if ( 'permissions' in navigator && navigator.permissions.query ) {
        /* query geolocation permissions */
        navigator.permissions.query( {
            name: 'geolocation'
        } ).then( result => {
            /* save permission state (denied, granted or prompt) */
            spacefinder.permission = result.state;
            if ( 'denied' == result.state ) {
                toggleGeolocation( false );
            } else {
                toggleGeolocation( true );
            }
            result.onchange = function() {
                spacefinder.permission = result.state;
                if ( 'denied' == result.state ) {
                    toggleGeolocation( false );
                } else {
                    toggleGeolocation( true );
                }
            }
        }).catch(error => {
            toggleGeolocation( false );
        });
    }
}

/**
 * Tests for availability of geolocation on client. If available,
 * adds buttons to activate it and adds listeners to buttons.
 */
function checkGeoAvailable() {
    splog( 'checkGeoAvailable', 'map.js' );
    if ( 'geolocation' in navigator ) {
        /* make button for map to let user activate geolocation */
        L.Control.geoControl = L.Control.extend({
            onAdd: function(map) {
                const locationButton = document.createElement( 'button' );
                locationButton.innerHTML = '';
                locationButton.classList.add('geo-button');
                locationButton.classList.add('icon-my-location');
                locationButton.setAttribute('aria-label', 'Use my location');
                locationButton.setAttribute('title', 'Use my location');
                return locationButton;
            },
            onRemove: function(map) {}
        });
        L.control.geoControl = function(opts) {
            return new L.Control.geoControl(opts);
        }
        L.control.geoControl( { position: 'topright' } ).addTo( spacefinder.map );

        /* add listener to buttons to toggle geolocation */
        document.addEventListener('click', e => {
            if ( e.target.matches('.geo-button') ) {
                if ( ! geolocationEnabled() ) {
                    return;
                }
                if ( geolocationActive() ) {
                    /* disable geolocation */
                    forgetUserPosition()
                } else {
                    /* get the current position */
                    getUserPosition();
                }
            }
        });

    } else {
        activateGeolocation( false );
        toggleGeolocation( false );
    }
}

/**
 * Cancels the watchPosition listener, removes the person marker,
 * and deactivates geolocation controls.
 */
function forgetUserPosition() {
    splog( 'forgetUserPosition', 'map.js' );
    /* stop watching user position */
    navigator.geolocation.clearWatch( spacefinder.watchID );
    /* remove person marker from map */
    spacefinder.personMarker.remove();
    /* make location buttons inactive */
    activateGeolocation( false );
    /* re-centre map */
    spacefinder.map.panTo( spacefinder.currentLoc );
}
/**
 * Gets the current position of the user device, centres the
 * map on that position and adds a marker. Then sets a 
 * geolocation.watchPosition listener to update the position 
 * when it changes.
 * TODO: watch for dragging of map by user - this should disable
 * recentring the map on the user position and (possibly) show a 
 * button to recentre? (but not moving the marker)
 */
function getUserPosition() {
    splog( 'getUserPosition', 'map.js' );
	navigator.geolocation.getCurrentPosition( position => {
        /* centre the map on the user coordinates */
		spacefinder.personLoc.lat = position.coords.latitude;
		spacefinder.personLoc.lng = position.coords.longitude;
        if ( ! spacefinder.mapBounds.contains( spacefinder.personLoc ) ) {
            toggleGeolocation( false );
            openAlertDialog('Sorry...', 'You need to be a bit nearer to use this feature.');
            return;
        }
        /* centre the map on the user position */
		spacefinder.map.panTo( spacefinder.personLoc );
        /* add a person marker */
		spacefinder.personMarker = L.marker( spacefinder.personLoc, { alt: 'Your location' } ).addTo( spacefinder.map );
        activateGeolocation( true );
        /* watch for changes in the user position and update the map by firing an event */
		spacefinder.watchID = navigator.geolocation.watchPosition( position => {
            if ( ! ( spacefinder.personLoc.lat == position.coords.latitude && spacefinder.personLoc.lng == position.coords.longitude ) ) {
                spacefinder.personLoc.lat = position.coords.latitude;
                spacefinder.personLoc.lng = position.coords.longitude;
                document.dispatchEvent( new Event( 'userlocationchanged' ) );
            }
        }, error => {
			navigator.geolocation.clearWatch( spacefinder.watchID );
            activateGeolocation( false );
		});

    }, (error) => {
        activateGeolocation( false );
		switch (error.code) {
			case 1:
				// Permission denied - The acquisition of the geolocation information failed because the page didn't have the permission to do it.
			case 2:
				// Position unavailable - The acquisition of the geolocation failed because at least one internal source of position returned an internal error.
                toggleGeolocation( false );
                break;
			case 3:
				// Timeout - The time allowed to acquire the geolocation was reached before the information was obtained.
		}
	});
}

/**
 * Updates the data-sortdistance attribute for all spaces relative
 * to the user position.
 */
function updateDistances() {
    splog( 'updateDistances', 'map.js' );
    if ( geolocationActive() ) {
        spacefinder.spaces.forEach( (space, index) => {
            spacefinder.spaces[index].distancefromcentre = haversine_distance( spacefinder.personLoc, { lat: space.lat, lng: space.lng } );
            document.querySelector('[data-id="' + space.id + '"]').setAttribute('data-sortdistance', spacefinder.spaces[index].distancefromcentre );
        });
    } else {
        let spacenodes = document.querySelectorAll('.list-space');
        if ( spacenodes !== null ) {
            spacenodes.forEach( el => el.setAttribute('data-sortdistance', '') );
        }
    }
}