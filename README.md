Spacefinder UI
==============

This repository contains a version of the UI for the Cambridge Spacefinder application (https://spacefinder.lib.cam.ac.uk/). It has been built to investigate possibilities for development of the application to make it usable in other higher education contexts.

The major change made to the original application (https://github.com/cambridge-collection/spacefinder/) is the decoupling of the application into User Interface and server-side components. Here, the data for all spaces is served as JSON files rather than using a data endpoint driven by a server-side application.

For more information about the project, [please visit the Spacefinder UI wiki](https://github.com/uol-library/spacefinder-ui/wiki/)

Changelog
---------

### 0.2.9 (13/10/2022)

* Fixed an issue with the search button on smaller screens
* Added Dublin Core metadata and meta description element

### 0.2.8 (6/10/2022)

* Fixed an issue with calculation of opening times
* updated robots.txt

### 0.2.7 (5/10/2022)

* Added a button to allow users to recentre the map if they have geolocation active and drag the map
* Refactored geolocation button to follow the same pattern as the recentre button
* Added more descriptive labels to distance sorting button
* Reinstated feedback modal

### 0.2.6 (4/10/2022)

* Fixed an issue with the geolocation marker

### 0.2.5 (29/9/2022)

* Fixed accessibility issues in space details, including reformatting links and adding more detail to image alt text
* Added a heading in each of the three application panes to help navigation in screen readers
* Upgraded Javascript libraries to include accessibility fixes
* Rewrite of map fullscreen control to make it into a button
* Updated multiple labels to add more descriptive text for screen readers
* Fixed focus bug in filters list
* Fixed bugs in selection of space on page load when an anchor is present in the URL

### 0.2.4 (16/9/2022)

* Added skip link to meet WCAG 2.1 - 2.4.1 Bypass Blocks
* Managed focus from cookie consent dialog

### 0.2.3 (14/9/2022)

* Fixed some UI inconsistencies to improve accessibility
* Improved performance in different accessibility testing tools

### 0.2.2 (9/9/2022)

* Bugfix release for a javascript error

### v0.2.1 (2/9/2022)

* Bundled PT Sans font rather than using version from Google
* Fixed instances where PT Sans was not being used
* Added focus to filters panel when activated
* Updated Privacy, Accessibility and About pages to reflect recent changes

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
