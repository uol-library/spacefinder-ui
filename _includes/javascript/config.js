/**
 * SpaceFinder configuration
 */
const spacefinder = {
    debug: {% if site.environment == "development" %}true{% else %}false{% endif %},
    closureDates: ["23-12-2022", "24-12-2022", "25-12-2022", "26-12-2022", "27-12-2022", "28-12-2022", "29-12-2022", "30-12-2022", "31-12-2022", "1-1-2023", "2-1-2023", "6-4-2023", "7-4-2023", "8-4-2023", "9-4-2023", "10-4-2023", "11-4-2023", "1-5-2023" ],

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
    spacesurl: '{{ site.url }}/spaces.json',
    imageBaseURL: '{{ site.url }}',

    /* filter related config */
    filters: [],
    filtersLoaded: false,
    filtersurl: '{{ site.url }}/filters.json'
};