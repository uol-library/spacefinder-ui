Spacefinder UI
==============

This repository contains data from the University of Cambridge Spacefinder application (https://spacefinder.lib.cam.ac.uk/) along with a stripped-down version of the User Interface for the application. This is to investigate possibilities for development of the application to make it usable in other higher education contexts.

Changes made to the original application
----------------------------------------

* The major change is the decoupling of the application into User Interface and server-side components. Here, the data for all spaces is served as a single JSON file rather than using a data endpoint driven by a server-side application.
* This change impacts on the loading and behaviour of the UI, making filtering of spaces by facets more responsive (as all the data is already present in te UI).
* Other parts of the application which were originally driven by AJAX calls (the loading of templates) have been altered so all templates are preloaded into the UI.

Impacts of these changes
------------------------

The main impact is the facilitation of alternative service to feed the UI - this implementation uses Github Pages and Jekyll, and the editing of space data is being investigated using NetlifyCMS with these systems. 

* The main impact of these changes is that the imitial load time for the application has been increased, but optimisations in the UI should eventually alleviate any increases to original load times.
* Rather than loading 35 spaces at a time, data for all spaces is loaded, which makes the map look much busier than it does in the live application.
* The loading of images for the UI has been optimised so only images which are in the viewport are loaded - others are laoded when they become visible.
* Functions for paging spaces and searching/filtering spaces have been decoupled from the server so they are more responsive in the UI.
* Some filters are mutually exclusive (noise levels for example) and have been made so in the UI.

Further development
-------------------

* The main purpose of this repository is to develop the UI of the application to make it accessible. List views, single space views and filtering controls need significant work to enable this (maps are considered to be exempt). Single space (detail) views are not currently enabled. Colour contrast needs to be improved, and conformance with WAI-ARIA added.
* Filtering works on the list of spaces but does not have any effect on the map at present.
* The current live application can use geolocation services to show the user their current location on the map and to sort the spaces by distance from the user. This has been disabled to facilitate further development of this feature.
* The spaces currently have no ordering enabled, but a haversine formula has been added to calculate the linear distance of each space from the centre of the map. This method is quicker than using google's DistanceMatrix API, but decreases accuracy and could be used for spaces ordering in the UI.
* Data from the original app included opening times and some user-generated content - this has been removed as it is intended that this type of content could be retrieved from other services (the google Places API and other optional services).


