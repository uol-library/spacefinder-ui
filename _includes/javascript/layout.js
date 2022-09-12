/**
 * Spacefinder layout setup
 * Sets event listeners on top bar navigation buttons
 */
document.addEventListener( 'DOMContentLoaded', () => {
	setupLayout();
    document.addEventListener( 'spacesloaded', setView );
    document.addEventListener( 'sfmapready', setView );
    document.addEventListener( 'filtersloaded', setView );
	document.addEventListener( 'sfresize', setView );
    window.addEventListener( 'resize', () => {
        clearTimeout( spacefinder.resizeTimeout );
        spacefinder.resizeTimeout = setTimeout( () => {
            splog( 'Resize event', 'layout.js' );
			document.dispatchEvent( new Event( 'sfresize' ) );
        }, 200);
    });
});

/**
 * Sets up layout event listeners
 */
function setupLayout() {
    /* event listener for top nav buttons */
	document.querySelectorAll( '#top-bar .navbutton' ).forEach( el => {
        el.addEventListener( 'click', event => {
            event.preventDefault();
            /* Dispatch a custom event (viewchange) with the name of the active view */
            document.getElementById( 'top-bar' ).dispatchEvent( new CustomEvent( 'viewchange', {
                bubbles: true,
                cancelable: true,
                composed: false,
                detail: {
                    view: el.getAttribute( 'data-view' )
                }
            } ) );
        });
    });
	/* event listener for view changes triggered by top nav */
	document.addEventListener( 'viewchange', event => {
		let views = [ 'filters', 'list', 'map' ];
		let changedview = document.getElementById( event.detail.view );
		/* special case for closing filters view */
		if ( event.detail.view == 'filters' && document.querySelector( '#top-bar .navbutton[data-view="filters"]' ).classList.contains( 'active' ) ) {
			document.querySelector( '#top-bar .navbutton[data-view="filters"]' ).classList.remove( 'active' );
			document.querySelector( '#top-bar .navbutton[data-view="filters"]' ).classList.add( 'inactive' );
			document.getElementById( 'filters' ).classList.remove( 'active' );
			document.getElementById( 'filters' ).classList.add( 'inactive' );
			document.querySelector( '#top-bar .navbutton[data-view="list"]' ).classList.add( 'active' );
			document.getElementById( 'list' ).classList.add( 'active' );
			//setElementFocus( 'listcontent' );
		} else {
			views.forEach(view => {
				document.getElementById( view ).classList.remove( 'active' );
				document.getElementById( view ).classList.add( 'inactive' );
				document.querySelector( '#top-bar .navbutton[data-view="'+view+'"]' ).classList.remove( 'active' );
				document.querySelector( '#top-bar .navbutton[data-view="'+view+'"]' ).classList.add( 'inactive' );

			});
			changedview.classList.add( 'active' );
			changedview.classList.remove( 'inactive' );
			document.querySelector( '#top-bar .navbutton[data-view="'+event.detail.view+'"]' ).classList.add( 'active' );
			document.querySelector( '#top-bar .navbutton[data-view="'+event.detail.view+'"]' ).classList.remove( 'inactive' );
			if ( event.detail.view == 'list' ) {
				//setElementFocus( 'listcontent' );
			} else if ( event.detail.view == 'filters' ) {
				window.setTimeout( function() { 
					document.getElementById( 'search-input' ).focus(); 
				}, 1000 );
				//setElementFocus( 'search-input' );
			} else if ( event.detail.view == 'map' ) {
				//setElementFocus( 'map' );
			}
		}
	});
}

/**
 * Sets the initial view of the app
 */
function setView() {
	if ( spacefinder.mapReady && spacefinder.spacesLoaded && spacefinder.filtersLoaded ) {
		splog('Setting view', 'layout.js' );
		if ( window.innerWidth >= spacefinder.breakpoints.large ) {
			splog('Showing filters panel', 'layout.js' );
			document.querySelector( '#top-bar .navbutton[data-view="filters"]' ).classList.add( 'active' );
			document.querySelector( '#top-bar .navbutton[data-view="filters"]' ).classList.remove( 'inactive' );
			document.getElementById( 'filters' ).classList.add( 'active' );
			document.getElementById( 'filters' ).classList.remove( 'inactive' );
		} else {
			splog('Hiding filters panel', 'layout.js' );
			document.querySelector( '#top-bar .navbutton[data-view="filters"]' ).classList.remove( 'active' );
			document.getElementById( 'filters' ).classList.remove( 'active' );
			document.querySelector( '#top-bar .navbutton[data-view="filters"]' ).classList.remove( 'active' );
			document.getElementById( 'filters' ).classList.remove( 'active' );
		}
		if ( window.innerWidth >= spacefinder.breakpoints.small ) {
			splog('Showing list panel', 'layout.js' );
			document.querySelector( '#top-bar .navbutton[data-view="list"]' ).classList.add( 'active' );
			document.getElementById( 'list' ).classList.add( 'active' );
		}
	}
}
