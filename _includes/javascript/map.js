/**
 * Google maps API functions for spacefinder
 */
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

/**
 * Initialise map and 
 */
function initMap() {
    spacefinder.map = new google.maps.Map(document.getElementById('map'), {
        center: spacefinder.currentLoc,
        zoom: spacefinder.startZoom,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });
    spacefinder.mapLoaded = google.maps.event.addListener( spacefinder.map, 'tilesloaded', () => {
        google.maps.event.removeListener( spacefinder.mapLoaded );
        spacefinder.mapLoaded = true;
        document.dispatchEvent( new Event( 'maploaded' ) );
    });
    document.addEventListener('spacesloaded', maybeSetupMap );
    document.addEventListener('maploaded', maybeSetupMap );
}
function maybeSetupMap() {
    if ( spacefinder.mapLoaded && spacefinder.spacesLoaded ) {
        var bounds = new google.maps.LatLngBounds();
        spacefinder.spaces.forEach( space => {
            if ( space.lat && space.lng ) {
                var spacePosition = new google.maps.LatLng( space.lat, space.lng );
                space.marker = new google.maps.Marker({
                    position: spacePosition,
                    map: spacefinder.map,
                    title: space.title,
                    icon: {
                        path: 'M0-30.5c-5.7,0-10.2,4.6-10.2,10.2C-10.2-14.6,0,0,0,0s10.2-14.6,10.2-20.2C10.2-25.9,5.7-30.5,0-30.5z M0-17.7c-1.6,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S1.6-17.7,0-17.7z',
                        fillColor: "#D6083B",
                        fillOpacity: 1,
                        scale: 1,
                        strokeWeight: 0
                    }
                });
                space.marker.infoContent = getSpaceInfoWindowContent( space );
                space.spaceInfo = new google.maps.InfoWindow();
                google.maps.event.addListener( space.marker, 'click', function (e) {
                    space.spaceInfo.setContent( space.marker.infoContent );
                    space.spaceInfo.open( spacefinder.map, space.marker );
                });
                bounds.extend( spacePosition );
            }
        });
        fitAllBounds( bounds );
    }
}
function getSpaceInfoWindowContent( space ) {
    return '<div class="spaceInfoWindow"><h3>'+space.title+'</h3><p>'+space.description+'</p></div>';
}
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
  