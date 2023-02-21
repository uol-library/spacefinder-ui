/**
 * SpaceFinder configuration
 */
const spacefinder = {
    debug: {% if site.environment == "development" %}true{% else %}false{% endif %},
    /**
     * global closure dates - these will affect ALL spaces
     * Dates should be in the format DD-MM-YYYY
     */
    closureDates: ["6-4-2023", "7-4-2023", "8-4-2023", "9-4-2023", "10-4-2023", "11-4-2023", "1-5-2023" ],

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
    currentLoc: {'lat': {{ site.data.config.map.startLat }}, 'lng': {{ site.data.config.map.startLng }} },
    startZoom: {{ site.data.config.map.startZoom }},
    mapBounds: null,
    mapZoom: null,
    mapLoaded: false,
    mapReady: false,
    resizeTimeout: null,

    /* geolocation related config */
    personLoc: {'lat': {{ site.data.config.map.startLat }}, 'lng': {{ site.data.config.map.startLng }} },
    personMarker: null,
    personWatcher: false,
    geoActive: false,
    watchID: false,
    permission: false,

    /* space related config */
    spaces: [],
    spacesLoaded: false,
    spacesurl: '{{ site.url }}{{ site.baseurl }}/spaces.json',
    imageBaseURL: '{{ site.url }}{{ site.baseurl }}',

    /* filter related config */
    filters: [],
    filtersLoaded: false,
    filtersurl: '{{ site.url }}{{ site.baseurl }}/filters.json'
};
