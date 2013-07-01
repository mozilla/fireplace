define('settings', ['l10n', 'settings_local', 'underscore'], function(l10n, settings_local, _) {
    var gettext = l10n.gettext;

    return _.defaults(settings_local, {
        init_module: 'marketplace',
        default_locale: 'en-US',
        api_url: 'http://' + window.location.hostname,  // No trailing slash, please.

        storage_version: '0',

        simulate_nav_pay: false,

        fragment_error_template: 'errors/fragment.html',
        pagination_error_template: 'errors/pagination.html',

        payments_enabled: true,
        tracking_enabled: false,
        action_tracking_enabled: true,
        upsell_enabled: true,

        tracking_id: 'UA-36116321-6',

        REGION_CHOICES_SLUG: {
            'worldwide': gettext('Worldwide'),
            'br': gettext('Brazil'),
            'co': gettext('Colombia'),
            'pl': gettext('Poland'),
            'rs': gettext('Serbia'),
            'me': gettext('Montenegro'),
            'es': gettext('Spain'),
            'uk': gettext('United Kingdom'),
            'us': gettext('United States'),
            've': gettext('Venezuela')
        },

        timing_url: '',  // TODO: figure this out

        persona_unverified_issuer: 'login.persona.org',

        title_suffix: 'Firefox Marketplace',
        carrier: null
    });
});
