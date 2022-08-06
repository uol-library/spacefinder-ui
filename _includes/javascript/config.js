const spacefinder = {
    debug: true,
    breakpoints: {
        large: 1000,
        med: 600,
        small: 400
    },
    
    map: null,
    osm: null,
    esri_sat: null,
    currentLoc: {'lat': 53.806529, 'lng': -1.555291},

    personLoc: {'lat': 53.806529, 'lng': -1.555291},
    personMarker: null,
    personWatcher: false,
    geoActive: false,
    watchID: false,
    permission: false,

    mapBounds: null,
    mapZoom: null,
    mapLoaded: false,
    resizeTimeout: null,

    spaces: [],
    spacesLoaded: false,
    spacesurl: '{{ site.url }}/spaces.json',

    filters: [],
    filtersLoaded: false,
    filtersurl: '{{ site.url }}/filters.json',
    imageBaseURL: '{{ site.url }}'
};    

