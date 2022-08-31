Spacefinder UI
==============

This repository contains a version of the UI for the Cambridge Spacefinder application (https://spacefinder.lib.cam.ac.uk/). It has been built to investigate possibilities for development of the application to make it usable in other higher education contexts.

The major change made to the original application (https://github.com/cambridge-collection/spacefinder/) is the decoupling of the application into User Interface and server-side components. Here, the data for all spaces is served as JSON files rather than using a data endpoint driven by a server-side application.

For more information about the project, [please visit the Spacefinder UI wiki](https://github.com/uol-library/spacefinder-ui/wiki/)

Changelog
---------

### v0.2.0 (31/8/2022)

* Changed map to use [Leaflet](https://leafletjs.com/) with tiles from [OpenStreetMap](https://www.openstreetmap.org/) and [ESRI](https://www.esri.com/)
* More Accessibility fixes
* Now loading filters data and space data via JSON
* New GitHub actions to enable scheduled and custom data updates
* Changed filter messages to better reflect what filters are being applied and whether they are additive (AND) or cumulative (OR)
* Changed Javascript to be more event driven

### v0.1.3 (14/6/2022)

* Added publishing switch to spaces to allow them to be turned on and off
* Removed Seminar Rooms space type from filters
* Added prayer room facilities to libraries

### v0.1.2 (9/6/2022)

* Accessibility fixes
* Bugfix (race condition)
* Changed Terms & Conditions to link to Corporate site, and added FOI link
* Added About page

### v0.1.1 (18/5/2022)

* Merged pilot branch into main
* Added Google Analytics and feedback form link in preparation for pilot
* Added opening times and filter to show spaces currently open 

### v0.1.0 (6/5/2022)

* Initial release
