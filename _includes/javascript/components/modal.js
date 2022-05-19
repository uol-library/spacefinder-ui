document.addEventListener('DOMContentLoaded', () => {
    /* change location hash when modals are activated */
    document.querySelectorAll('.modal-trigger').forEach( mb => {
        let dialogid = mb.getAttribute('data-dialogid');
        let pagehash = mb.getAttribute('data-dialoghash');
        let dialog = new A11yDialog( document.getElementById( dialogid ) );
        mb.addEventListener('click', e => {
            dialog.show();
            dialog.originalpagehash = window.location.hash;
            window.location.hash = '#/page/'+pagehash;
            document.dispatchEvent(new CustomEvent('sfanalytics', {
                detail: {
                    type: 'select',
                    id: pagehash,
                    name: e.target.textContent
                }
            }));
        });
        dialog.on('hide', (element, event) => {
            window.location.hash = dialog.originalpagehash
        });
    });
    setTimeout( () => {
        openAlertDialog('Spacefinder feedback', 'Can you please help us improve this site by <a id="fb-link" href="https://forms.office.com/Pages/ResponsePage.aspx?id=qO3qvR3IzkWGPlIypTW3y1HKKRLEEutMhj3gY5HWuwpUOFk0R0RQUjEzN0xUTjRXV0pTT1NGTE9HMy4u" target="sf_feedback">providing feedback using this short form</a> (opens in a new browser window / tab).');
        document.getElementById('fb-link').addEventListener('click', e => {
            let dialog = new A11yDialog( document.getElementById( 'sfalertdialog' ) );
            dialog.hide();
        });
    }, 30000)
    
});
function openAlertDialog( title, content ) {
    document.getElementById('sfalertdialog-title').textContent = title;
    document.getElementById('sfalertdialog-description').innerHTML = content;
    let dialog = new A11yDialog( document.getElementById( 'sfalertdialog' ) );
    dialog.show();
    dialog.on('hide', (element, event) => {
        document.getElementById('sfalertdialog-title').textContent = '';
        document.getElementById('sfalertdialog-description').textContent = '';
    });
}
