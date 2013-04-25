define('settings_base', [], function() {
    var settings = {
        api_url: 'http://' + window.location.hostname + ':5000',  // No trailing slash, please.

        simulate_nav_pay: false,

        fragment_error_template: 'errors/fragment.html',

        payments_enabled: true,
        tracking_enabled: false,

        // TODO: put real values here.
        REGION_CHOICES_SLUG: {
            'us': 'United States',
            'br': 'Brazil',
            'es': 'Spain'
        },

        timing_url: '',  // TODO: figure this out

        persona_unverified_issuer: null,
        login_provider: 'https://marketplace-dev.allizom.org',
        native_persona: 'https://native-persona.org/include.js',
        persona: 'https://login.persona.org/include.js',

        title_suffix: 'Firefox Marketplace',
        carrier: null
    };
    return settings;
});
