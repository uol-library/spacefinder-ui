document.addEventListener('DOMContentLoaded', () => {
	spacefinder.map = new google.maps.Map(document.getElementById('map'), {
		center: spacefinder.currentLoc,
		zoom: 10,
		disableDefaultUI: true,
		zoomControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT
		},
        mapTypeId: google.maps.MapTypeId.ROADMAP,
	});
    spacefinder.mapLoaded = google.maps.event.addListener( spacefinder.map, 'tilesloaded', () => {
        google.maps.event.removeListener( spacefinder.mapLoaded );
        document.dispatchEvent( new Event( 'maploaded' ) );
    });
});