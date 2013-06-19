define('settings', ['settings_local', 'underscore'], function(settings_local, _) {
    return _.defaults(settings_local, {
        api_url: 'http://' + window.location.hostname,  // No trailing slash, please.

        simulate_nav_pay: false,

        fragment_error_template: 'errors/fragment.html',
        pagination_error_template: 'errors/pagination.html',

        payments_enabled: true,
        tracking_enabled: false,
        action_tracking_enabled: true,
        upsell_enabled: false,

        tracking_id: 'UA-36116321-6',

        REGION_CHOICES_SLUG: {
            'worldwide': 'Worldwide',
            'br': 'Brazil',
            'co': 'Colombia',
            'pl': 'Poland',
            'es': 'Spain',
            'uk': 'United Kingdom',
            'us': 'United States',
            've': 'Venezuela'
        },

        timing_url: '',  // TODO: figure this out

        persona_unverified_issuer: 'login.persona.org',

        title_suffix: 'Firefox Marketplace',
        carrier: null
    });
});
