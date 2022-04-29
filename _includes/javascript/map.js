/**
 * Google maps API functions for spacefinder
 */
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    document.addEventListener( 'sfmaploaded', checkGeo );
});

/**
 * Initialise map and set listeners to set up markers when loaded
 */
function initMap() {
    spacefinder.map = new google.maps.Map(document.getElementById('map'), {
        center: spacefinder.currentLoc,
        zoom: spacefinder.startZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });
    google.maps.event.addListenerOnce( spacefinder.map, 'tilesloaded', () => {
        spacefinder.mapLoaded = true;
        document.dispatchEvent( new Event( 'sfmaploaded' ) );
    });
    document.addEventListener('spacesloaded', maybeSetupMap );
    document.addEventListener('sfmaploaded', maybeSetupMap );
}

/**
 * Sets up te map with markers for each space. Needs to run when
 * the map is fully loaded and the space data is fully loaded.
 */
function maybeSetupMap() {
    if ( spacefinder.mapLoaded && spacefinder.spacesLoaded ) {
        spacefinder.mapBounds = new google.maps.LatLngBounds();
        spacefinder.infoWindow = new google.maps.InfoWindow({
            maxWidth: 350
        });
        /* add each spoace to the map using a marker */
        for ( let i = 0; i < spacefinder.spaces.length; i++ ) {
            if ( spacefinder.spaces[i].lat && spacefinder.spaces[i].lng ) {
                var spacePosition = new google.maps.LatLng( spacefinder.spaces[i].lat, spacefinder.spaces[i].lng );
                spacefinder.spaces[i].marker = new google.maps.Marker({
                    position: spacePosition,
                    map: spacefinder.map,
                    title: spacefinder.spaces[i].title,
                    icon: {
                        path: 'M0-30.5c-5.7,0-10.2,4.6-10.2,10.2C-10.2-14.6,0,0,0,0s10.2-14.6,10.2-20.2C10.2-25.9,5.7-30.5,0-30.5z M0-17.7c-1.6,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S1.6-17.7,0-17.7z',
                        fillColor: "#D6083B",
                        fillOpacity: 1,
                        scale: 1,
                        strokeWeight: 0
                    }
                });
                spacefinder.spaces[i].marker.infoContent = getSpaceInfoWindowContent( spacefinder.spaces[i] );
                google.maps.event.addListener( spacefinder.spaces[i].marker, 'click', function (e) {
                    spacefinder.infoWindow.setContent( spacefinder.spaces[i].marker.infoContent );
                    spacefinder.infoWindow.open( spacefinder.map, spacefinder.spaces[i].marker );
                    selectSpace(spacefinder.spaces[i].id);
                });
                spacefinder.mapBounds.extend( spacePosition );
            }
        }
        google.maps.event.addListener(spacefinder.infoWindow,'closeclick',function(){
            deselectSpace( true );
            recentreMap();
        });
        fitAllBounds( spacefinder.mapBounds );
        document.dispatchEvent( new Event( 'sfmapready' ) );
    }
}

/**
 * Returns HTML for an individual space's infoWindow 
 * @param {Object} space 
 * @returns {String} HTML content for space infoWindow
 */
function getSpaceInfoWindowContent( space ) {
    return '<div class="spaceInfoWindow"><h3>'+space.title+'</h3><p>'+space.description+'</p></div>';
}

/**
 * Takes the current bounds of the map and ensures all
 * markers fit within the visible area while keeping the
 * map centred on a given location (by setting the zoom).
 * @param {google.maps.LatLngBounds} b bounds object
 */
function fitAllBounds(b) {
    // Get north east and south west markers bounds coordinates
    var ne = b.getNorthEast();
    var sw = b.getSouthWest();
    // Get the current map bounds
    var mapBounds = spacefinder.map.getBounds();
    // Check if map bounds contains both north east and south west points
    if (mapBounds.contains(ne) && mapBounds.contains(sw)) {
        // Everything fits
        return;
    } else {
        var mapZoom = spacefinder.map.getZoom();
        if (mapZoom > 0) {
            // Zoom out
            spacefinder.map.setZoom(mapZoom - 1);
            // Try again
            fitAllBounds(b);
        }
    }
}

function recentreMap() {
    let newCenter = geolocationActive() ? spacefinder.personLoc: spacefinder.currentLoc;
    spacefinder.map.setCenter( newCenter );
    fitAllBounds( spacefinder.mapBounds );
}
/**
 * Zooms the map to show a particular space
 * @param {Object} space
 */
function zoomMapToSpace( space ) {
    let newCenter = new google.maps.LatLng( space.lat, space.lng );
    spacefinder.map.panTo( newCenter );
    spacefinder.map.setZoom(18);
    spacefinder.infoWindow.setContent( getSpaceInfoWindowContent( space ) );
    spacefinder.infoWindow.open( spacefinder.map, space.marker );    
}

/*******************************************************************
 * GEOLOCATION
 *******************************************************************/

/**
 * Toggle the disabled attribute of the geolocation control
 * @param {boolean} enable which way to toggle
 */
function toggleGeolocation( enable ) {
    if ( enable ) {
        document.querySelectorAll( '.geo-button' ).forEach( e => e.disabled = false );
    } else {
        document.querySelectorAll( '.geo-button' ).forEach( e => e.disabled = true );
    }
}

/**
 * Toggle the active class of the geolocation control.
 * Also adds/removes the event listener to update the user's position
 * @param {boolean} activate which way to toggle
 */
function activateGeolocation( activate ) {
    if ( activate ) {
        document.querySelectorAll( '.geo-button' ).forEach( e => e.classList.add('active') );
        document.addEventListener( 'userlocationchanged', movePersonMarker );
    } else {
        document.querySelectorAll( '.geo-button' ).forEach( e => e.classList.remove('active') );
        document.removeEventListener( 'userlocationchanged', movePersonMarker );
    }
}

/**
 * Moves the person marker to the user's position and centres the 
 * map on that position. The property spacefinder.personLoc is used
 * for the user position - this is updated in the geolocation.watchPosition
 * event listener
 * @see getUserPosition()
 */
function movePersonMarker() {
    if ( spacefinder.personMarker ) {
        spacefinder.personMarker.setPosition( spacefinder.personLoc );
    }
    spacefinder.map.setCenter( spacefinder.personLoc );
}

/**
 * Test to see if geolocation services are enabled
 * @returns {boolean}
 */
function geolocationEnabled() {
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
    return ( document.querySelector( '.geo-button.active' ) !== null ? true: false );
}

/**
 * Performs checks for geolocation permissions and services when the map has loaded
 */
function checkGeo() {
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
    if ( 'geolocation' in navigator ) {
        /* make button for map to let user activate geolocation */
        const locationButton = document.createElement( 'button' );
        locationButton.innerHTML = '';
        locationButton.classList.add('geo-button');
        locationButton.classList.add('icon-my-location');
        locationButton.setAttribute('aria-label', 'Pan to Current Location');
        locationButton.setAttribute('title', 'Pan to Current Location');
        spacefinder.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(locationButton);

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
function forgetUserPosition() {
    /* stop watching user position */
    navigator.geolocation.clearWatch( spacefinder.watchID );
    /* remove personmarker from map */
    spacefinder.personMarker.setMap(null);
    /* make location buttons inactive */
    activateGeolocation( false );
    /* re-centre map */
    spacefinder.map.setCenter( spacefinder.currentLoc );
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
	navigator.geolocation.getCurrentPosition( position => {
        /* centre the map on the user coordinates */
		spacefinder.personLoc.lat = position.coords.latitude;
		spacefinder.personLoc.lng = position.coords.longitude;
        if ( ! spacefinder.mapBounds.contains( spacefinder.personLoc ) ) {
            toggleGeolocation( false );
            openAlertDialog('Sorry...', 'You need to be a bit nearer to use this feature.');
            return;
        }
        /* activate the geolocation buttons */
        activateGeolocation( true );
		spacefinder.map.setCenter( spacefinder.personLoc );
        /* add a marker */
		spacefinder.personMarker = new google.maps.Marker({
			position: spacefinder.personLoc,
			map: spacefinder.map,
			title: 'Your location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillOpacity: 1,
                strokeWeight: 2,
                fillColor: '#5384ED',
                strokeColor: '#ffffff',
            },
		});
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
		switch (error.code) {
			case 1:
				// Permission denied - The acquisition of the geolocation information failed because the page didn't have the permission to do it.
			case 2:
				// Position unavailable - The acquisition of the geolocation failed because at least one internal source of position returned an internal error.
                activateGeolocation( false );
                toggleGeolocation( false );
                break;
			case 3:
				// Timeout - The time allowed to acquire the geolocation was reached before the information was obtained.
		}
	});
}
