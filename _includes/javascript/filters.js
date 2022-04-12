/**
 * Functions for the filters panel in the UI
 */
document.addEventListener('DOMContentLoaded', () => {
    setupFilters();
});
/* gets the current status of all filters */
function getFilterStatus() {
    const filters = document.querySelectorAll('#filters input[type=checkbox]');
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
    let inputvalue = document.getElementById('search-input').value.trim().toLowerCase();
    if ( inputvalue.length > 1 ) {
        activeFilters.push({
            name: 'search',
            value: inputvalue.split(" ")
        });
    }
    return activeFilters;
}


/* setup */
function setupFilters() {
    /* event to listen for when filters change */
    const filterEvent = new Event('viewfilter', {
        bubbles: true,
        cancelable: true,
        composed: false,
    });
    /* event listener for filter changes */
    document.getElementById('filters').addEventListener('viewfilter', event => {
        const activeFilters = getFilterStatus();
        if ( activeFilters.length ) {
            document.getElementById('search-reset').removeAttribute('disabled');
        } else {
            document.getElementById('search-reset').setAttribute('disabled', true);
        }
    });

    /* add radio button behaviour to checkboxes with exclusive attribute */
    const filters = document.querySelectorAll('#filters input[type=checkbox]');
    for (const cbx of filters) {
        cbx.addEventListener('focus', eventElement => {
            eventElement.target.closest('li').classList.add('focus');
        });
        cbx.addEventListener('blur', eventElement => {
            document.querySelectorAll('#filters li').forEach( el => el.classList.remove('focus') );
        });

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
            if ( ! item.checked ) {
                //item.closest('li').classList.remove('focus');
            }
            /* trigger the viewfilter event */
            item.dispatchEvent(filterEvent);
        })
    }
    /* reset button */
    document.getElementById('search-reset').addEventListener('click', event => {
        event.preventDefault();
        document.getElementById('filter-options-form').reset();
        const filters = document.querySelectorAll('#filters input[type=checkbox]');
        for (const cbx of filters) {
            cbx.checked = false;
        }
        /* trigger the viewfilter event */
        event.target.dispatchEvent(filterEvent);
    });
    /* search button */
    document.getElementById('search-input').addEventListener('input', event => {
        let inputvalue = document.getElementById('search-input').value.trim();
        if ( inputvalue.length > 1 ) {
            document.getElementById('search-reset').disabled = false;
            document.getElementById('search-submit').disabled = false;
        } else {
            document.getElementById('search-reset').disabled = true;
            document.getElementById('search-submit').disabled = true;
            if ( inputvalue.length == 0 ) {
                /* search has been cleared */
                event.target.dispatchEvent(filterEvent);
            }
        }
    });
    /* search action */
    document.getElementById('search-submit').addEventListener('click', event => {
        event.preventDefault();
        let inputvalue = document.getElementById('search-input').value.trim();
        if ( inputvalue.length > 1 ) {
            /* trigger the viewfilter event */
            event.target.dispatchEvent(filterEvent);
        }
    });
}

