/* setup */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener( 'sfanalytics', e => {
        if ( typeof gtag == 'function' ) {
            if ( e.detail.type == 'search' ) {
                gtag('event','search', {
                    search_term: e.detail.terms
                });
            } else if ( e.detail.type == 'filter' ) {
                gtag('event','select_content', {
                    'content_type': e.detail.filtername,
                    'item_id': e.detail.terms
                });
            } else if ( e.detail.type == 'geostart' ) {
                gtag('event','level_start', {
                    'level_name': 'Geolocation activated'
                });
            } else if ( e.detail.type == 'geoend' ) {
                gtag('event','level_end', {
                    'level_name': 'Geolocation deactivated'
                });
            } else if (e.detail.type == 'select') {
                gtag('event', 'select_item', {
                    item_list_id: e.detail.src,
                    item_list_name: e.detail.src,
                    items: [
                        {
                            item_id: e.detail.id,
                            item_name: e.detail.name
                        }
                    ]
                });
            }
        }
    });
});