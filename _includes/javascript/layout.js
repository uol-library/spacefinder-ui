/* setup */
document.addEventListener('DOMContentLoaded', () => {
	setupLayout();
});
/**
 * Sets up layout event listeners
 */
function setupLayout() {
    /* event listener for top nav buttons */
	document.querySelectorAll('#top-bar .button').forEach( el => {
        el.addEventListener( 'click', event => {
            event.preventDefault();
            let isactive = el.classList.toggle( 'active' );
            if ( isactive ) {
                document.querySelectorAll('#top-bar .button').forEach( other => {
                    if ( el != other ) {
                        other.classList.remove('active');
                    }
                });
            }
            /* Dispatch a custom event (viewchange) with the name of the active view */
            document.getElementById('top-bar').dispatchEvent( new CustomEvent( 'viewchange', {
                bubbles: true,
                cancelable: true,
                composed: false,
                detail: {
                    view: el.getAttribute('data-view'),
                    active: isactive
                }
            } ) );
        });
    });
	/* event listener for close button on single space view */
	document.getElementById('ss-close').addEventListener('click', event => {
		event.preventDefault();
		document.getElementById('list').classList.remove('single');
		document.getElementById('view-single').classList.remove('active');
	});
	/* event listener for view changes triggered by top nav */
	document.addEventListener( 'viewchange', event => {
		let views = ['filters','list','map'];
		let changedview = document.getElementById( event.detail.view );
		if ( event.detail.view == 'single' ) {
			views.forEach(view => {
				document.getElementById( view ).classList.remove( 'active' );
			});
			document.getElementById('list').classList.add( 'active' );
			if ( event.detail.active ) {
				document.getElementById('list').classList.add( 'single' );
			} else {
				document.getElementById('list').classList.remove( 'single' );
			}
		} else {
			views.forEach(view => {
				document.getElementById( view ).classList.remove( 'active' );
			});
			if ( event.detail.active ) {
				changedview.classList.add( 'active' );
			} else {
				changedview.classList.remove( 'active' );
			}
		}
	});
}