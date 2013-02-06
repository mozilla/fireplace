var settings = {
    api_url: 'http://localhost:5000',  // No trailing slash, please.
    persona_unverified_issuer: null,
    // To be used only outside of the simulator/device
    persona_url: 'https://login.persona.org/include.js',

    simulate_nav_pay: false,
    allow_anon_installs: true,

    fragment_error_template: 'errors.fragment',

    payments_enabled: false,
    search_suggestions_enabled: true,
    tracking_enabled: false,

    // TODO: put real values here.
    REGION_CHOICES_SLUG: {
        'usa': 'United States',
        'bra': 'Brazil'
    }
};

define('settings', [], function () {
    return settings;
});