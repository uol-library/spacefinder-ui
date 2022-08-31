/**
 * SpaceFinder configuration
 */
const spacefinder = {
    debug: false,

    /* CSS breakpoints */
    breakpoints: {
        large: 1000,
        med: 600,
        small: 400
    },

    /* map related config */
    map: null,
    osm: null,
    esri_sat: null,
    currentLoc: {'lat': 53.806529, 'lng': -1.555291},
    startZoom: 16,
    mapBounds: null,
    mapZoom: null,
    mapLoaded: false,
    resizeTimeout: null,

    /* geolocation related config */
    personLoc: {'lat': 53.806529, 'lng': -1.555291},
    personMarker: null,
    personWatcher: false,
    geoActive: false,
    watchID: false,
    permission: false,

    /* space related config */
    spaces: [],
    spacesLoaded: false,
    spacesurl: '{{ site.url }}/spaces.json',
    imageBaseURL: '{{ site.url }}',

    /* filter related config */
    filters: [],
    filtersLoaded: false,
    filtersurl: '{{ site.url }}/filters.json'
};