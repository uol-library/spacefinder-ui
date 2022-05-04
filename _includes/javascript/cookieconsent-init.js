/**
 * Cookie Consent configuration
 * @see https://github.com/orestbida/cookieconsent
 */
var cc = initCookieConsent();

cc.run({
    current_lang: 'en',
    autoclear_cookies: true,
    page_scripts: true,
    remove_cookie_tables: true,
    onFirstAction: function(user_preferences, cookie){
        //console.log(user_preferences);
        //console.log(cookie);
    },
    onAccept: function (cookie) {
        //console.log(cookie);
    },
    onChange: function (cookie, changed_preferences) {
        //console.log(changed_preferences);
        //console.log(cookie);
    },
    gui_options: {
        consent_modal: {
            layout: 'box', 
            position: 'bottom center',
            transition: 'slide', 
            swap_buttons: false
        },
        settings_modal: {
            layout: 'bar',
            position: 'left',
            transition: 'slide'
        }
    },
    languages: {
        'en': {
            consent_modal: {
                title: 'Tell us whether you accept cookies',
                description: 'This website uses essential cookies to ensure its proper operation, performance cookies to help it work faster, and tracking cookies to understand how you interact with it. Performance and tracking cookies will be set only after consent is given. <button type="button" data-cc="c-settings" class="cc-link">Let me choose</button>',
                primary_btn: {
                    text: 'Accept all',
                    role: 'accept_all'
                },
                secondary_btn: {
                    text: 'Reject all',
                    role: 'accept_necessary'
                }
            },
            settings_modal: {
                title: 'Cookie preferences',
                save_settings_btn: 'Save settings',
                accept_all_btn: 'Accept all',
                reject_all_btn: 'Reject all',
                close_btn_label: 'Close',
                cookie_table_headers: [
                    {col1: 'Name'},
                    {col2: 'Domain'},
                    {col3: 'Expiration'},
                    {col4: 'Description'}
                ],
                blocks: [
                    {
                        title: 'Cookie usage',
                        description: 'This website uses cookies to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#" class="cc-link modal-trigger" data-dialoghash="privacy" data-dialogid="privacy-page">privacy policy</a>.'
                    }, {
                        title: 'Strictly necessary cookies',
                        description: 'These cookies are essential for the proper functioning of this website. Without these cookies, the website would not remember your cookie preferences.',
                        toggle: {
                            value: 'necessary',
                            enabled: true,
                            readonly: true
                        }
                    }, {
                        title: 'Performance cookies',
                        description: 'These cookies allow the website to store data so the website works more efficiently between visits.',
                        toggle: {
                            value: 'performance',
                            enabled: false,
                            readonly: false
                        }
                    }, {
                        title: 'Analytics cookies',
                        description: 'Analytics tools set cookies that store anonymised information about how you got to the site and what you click on while you are visiting the site. We do not allow other organisations to use or share the data about how you use this site.',
                        toggle: {
                            value: 'analytics',
                            enabled: false,
                            readonly: false
                        },
                        cookie_table: [
                            {
                                col1: '^_ga',
                                col2: 'google.com',
                                col3: '2 years',
                                col4: 'These cookies are used to distinguish between different users of the site and remember your usage across visits.',
                                is_regex: true
                            },
                            {
                                col1: '_gid',
                                col2: 'google.com',
                                col3: '1 day',
                                col4: 'This cookie is used to distinguish between different users.',
                            }
                        ]
                    }, {
                        title: 'More information',
                        description: 'You can manage your privacy settings, including cookies, through your browser settings. Further information about cookies can be found on the <a target="_ico" href="https://ico.org.uk/">Information Commissioner’s Office website</a>.',
                    }
                ]
            }
        }
    }
});
function canUseLocalStorage(){
    return cc.allowedCategory('performance');
}
function showCookieSettings() {
    cc.showSettings();
}