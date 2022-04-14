Spacefinder UI
==============

This repository contains a version of the UI for the Cambridge Spacefinder application (https://spacefinder.lib.cam.ac.uk/). It has been built to investigate possibilities for development of the application to make it usable in other higher education contexts.

Changes made to the original application
----------------------------------------

* The major change is the decoupling of the application into User Interface and server-side components. Here, the data for all spaces is served as a single JSON file rather than using a data endpoint driven by a server-side application.
* This change impacts on the loading and behaviour of the UI, making filtering of spaces by facets more responsive (as all the data is already present in te UI).
* Other parts of the application which were originally driven by AJAX calls (the loading of templates) have been altered so all templates are preloaded into the UI.

Impacts of these changes
------------------------

The main impact is the facilitation of alternative service to feed the UI - this implementation uses Github Pages and Jekyll, and the editing of space data is being investigated using NetlifyCMS with these systems. 

* The imitial load time for the application has been increased, but optimisations in the UI should eventually alleviate any increases to original load times.
* Rather than loading 35 spaces at a time, data for all spaces is loaded, which makes the map look much busier than it does in the live application.
* The loading of images for the UI has been optimised so only images which are in the viewport are loaded - others are laoded when they become visible.
* Functions for paging spaces and searching/filtering spaces have been decoupled from the server so they are more responsive in the UI.
* Some filters are mutually exclusive (noise levels for example) and have been made so in the UI.
* Data from the original app included opening times and some user-generated content - this has been removed (temporarily)

Additional Features
-------------------

* The main purpose of this repository is to develop the UI of the application to make it accessible. List views, single space views and filtering controls have been changed enable this (maps are considered to be exempt). Colour contrast has been improved, and conformance with WAI-ARIA added.
* The ability to sort spaces alphabetically or by distance from the user (if geolocation services are enabled).
* The ability to search spaces by keyword
* User feedback in the list view to show which search terms or filters are used and allow them to be removed.

Features under development
--------------------------

* Geolocation services to show the user their current location on the map and allow users to sort the spaces by distance from their location are enabled but need to be thoroughly tested.
* Filtering works on the list of spaces but does not have any effect on the map at present.
* Javascript uses ES6 syntax and some features not implemented in older browsers. Transpiling and the use of polyfills is intended to be used in the production application.


