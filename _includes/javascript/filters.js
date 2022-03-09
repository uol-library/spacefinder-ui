/**
 * Functions for the filters panel in the UI
 */

/* geolocation button */
if ( 'geolocation' in navigator ) {
	document.getElementById('near-me-btn').disabled = false;
    document.getElementById('near-me-btn').addEventListener('click', function () {
	    // get the current position
	    navigator.geolocation.getCurrentPosition( position => {
		    console.log('Your location: lat: '+position.coords.latitude+', lng: '+position.coords.longitude);
	    }, () => {
		    console.log('Failed to get your location!');
		    document.getElementById('near-me-btn').disabled = true;
	    });
	});
}

/* event to listen for when filters change */
const filterEvent = new Event('viewfilter', {
    bubbles: true,
    cancelable: true,
    composed: false,
});

/* setup */
document.addEventListener('DOMContentLoaded', () => {
    /* event listener for filter changes */
    document.getElementById('filter').addEventListener('viewfilter', event => {
        const filters = document.querySelectorAll('#filter input[type=checkbox]');
        const activeFilters = [];
        for (const cbx of filters) {
            if (cbx.checked) {
                let us = cbx.getAttribute('value').indexOf('_');
                const filterName = cbx.getAttribute('value').substring( 0, us );
                const filterValue = cbx.getAttribute('value').substring( us + 1 );
                let appended = false;
                if ( activeFilters.length ) {
                    for ( let i = 0; i < activeFilters.length; i++ ) {
                        if ( activeFilters[i].name == filterName && activeFilters[i].value.indexOf(filterValue) == -1 ) {
                            activeFilters[i].value.push(filterValue);
                            appended = true;
                        }
                    }
                }
                if ( ! appended ) {
                    activeFilters.push({
                        name: filterName,
                        value: [filterValue]
                    });
                }
            }
        }
        if ( activeFilters.length ) {
            document.getElementById('clear-all').removeAttribute('disabled');
            console.log(activeFilters);
        } else {
            document.getElementById('clear-all').setAttribute('disabled', true);
            console.log('no filters currently active');
        }
    });
    /* add radio button behaviour to checkboxes with exclusive attribute */
	const filters = document.querySelectorAll('#filter input[type=checkbox]');
	for (const cbx of filters) {
        cbx.addEventListener('change', eventElement => {
			const item = eventElement.target;
            if (item.matches('.exclusive')) {
				const itemStatus = item.checked;
				const sibs = item.closest('ul').querySelectorAll('input[type=checkbox].exclusive');
				for (const sib of sibs) {
					sib.checked = false;
				}
				item.checked = itemStatus;
            }
            /* trigger the viewfilter event */
			item.dispatchEvent(filterEvent);
        })
    }
    /* clear all filters button */
	document.getElementById('clear-all').addEventListener('click', event => {
        event.preventDefault();
		const filters = document.querySelectorAll('#filter input[type=checkbox]');
		for (const cbx of filters) {
			cbx.checked = false;
		}
        /* trigger the viewfilter event */
		event.target.dispatchEvent(filterEvent);
	});
});

