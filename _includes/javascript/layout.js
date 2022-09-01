/**
 * Spacefinder layout setup
 * Sets event listeners on top bar navigation buttons
 */
document.addEventListener( 'DOMContentLoaded', () => {
	setupLayout();
    document.addEventListener( 'spacesloaded', maybeShowFilters );
    document.addEventListener( 'sfmaploaded', maybeShowFilters );
    document.addEventListener( 'filtersloaded', maybeShowFilters );
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
			document.getElementById( 'filters' ).classList.remove( 'active' );
			document.querySelector( '#top-bar .navbutton[data-view="list"]' ).classList.add( 'active' );
			document.getElementById( 'list' ).classList.add( 'active' );
			document.getElementById( 'listcontent' ).setAttribute( 'tabindex', '-1' );
			document.getElementById( 'listcontent' ).focus();
		} else {
			views.forEach(view => {
				document.getElementById( view ).classList.remove( 'active' );
				document.querySelector( '#top-bar .navbutton[data-view="'+view+'"]' ).classList.remove( 'active' );
			});
			changedview.classList.add( 'active' );
			document.querySelector( '#top-bar .navbutton[data-view="'+event.detail.view+'"]' ).classList.add( 'active' );
			if ( event.detail.view == 'list' ) {
				document.getElementById( 'listcontent' ).setAttribute( 'tabindex', '-1' );
				document.getElementById( 'listcontent' ).focus();
			} else if ( event.detail.view == 'filters' ) {
				console.log('setting focus on form');
				document.getElementById( 'filter-options-form' ).setAttribute( 'tabindex', '-1' );
				document.getElementById( 'filter-options-form' ).focus();
			}
		}
	});
}

/**
 * Shows the filter/search panel if the screen big enough
 */
function maybeShowFilters() {
	if ( spacefinder.mapLoaded && spacefinder.spacesLoaded && spacefinder.filtersLoaded && window.innerWidth >= spacefinder.breakpoints.large ) {
		document.dispatchEvent( new CustomEvent( 'viewchange', {
			bubbles: true,
			cancelable: true,
			composed: false,
			detail: {
				view: 'filters'
			}
		} ) );
	}
}