const spacefinder = {
    debug: false,
    breakpoints: {
        large: 1000,
        med: 600,
        small: 400
    },
    map: null,
    currentLoc: {'lat': 53.806529, 'lng': -1.555291},
    personLoc: {'lat': 53.806529, 'lng': -1.555291},
    personMarker: null,
    personWatcher: false,
    geoActive: false,
    infoWindow: null,
    startZoom: 16,
    mapBounds: null,
    watchID: false,
    permission: false,
    mapLoaded: false,
    spaces: [],
    spacesLoaded: false,
    spacesurl: '{{ site.url }}/spaces.json',
    filters: [],
    filtersLoaded: false,
    filtersurl: '{{ site.url }}/filters.json',
    imageBaseURL: '{{ site.url }}'
};    

