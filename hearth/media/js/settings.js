define('settings', ['l10n', 'settings_local', 'underscore'], function(l10n, settings_local, _) {
    var gettext = l10n.gettext;

    var base_settings = JSON.parse(document.body.dataset.settings || '{}');
    base_settings = _.defaults(base_settings, settings_local);

    return _.defaults(base_settings, {
        app_name: 'fireplace',
        init_module: 'marketplace',
        default_locale: 'en-US',
        api_url: 'http://' + window.location.hostname,  // No trailing slash, please.

        // The version number for localStorage data. Bump when the schema for
        // storing data in localStorage changes.
        storage_version: '0',

        // Set to true to simulate navigator.mozPay.
        simulate_nav_pay: false,

        // The list of query string parameters that are not stripped when
        // removing navigation loops.
        param_whitelist: ['q', 'sort', 'cat'],

        // The list of models and their primary key mapping. Used by caching.
        model_prototypes: {
            'app': 'slug',
            'category': 'slug',

            // Dummy prototypes to facilitate testing:
            'dummy': 'id',
            'dummy2': 'id'
        },

        // Error template paths. Used by builder.js.
        fragment_error_template: 'errors/fragment.html',
        pagination_error_template: 'errors/pagination.html',

        // Switches for features.
        payments_enabled: true,
        tracking_enabled: false,
        action_tracking_enabled: true,
        upsell_enabled: true,
        newsletter_enabled: true,
        cache_rewriting_enabled: true,
        potatolytics_enabled: false,

        // Enabling this settings will mock compatibility with all apps.
        never_incompat: false,

        // The GA tracking ID for this app.
        tracking_id: 'UA-36116321-6',

        // A list of regions and their L10n mappings.
        REGION_CHOICES_SLUG: {
            'worldwide': gettext('Worldwide'),
            'br': gettext('Brazil'),
            'co': gettext('Colombia'),
            'hu': gettext('Hungary'),
            'me': gettext('Montenegro'),
            'pl': gettext('Poland'),
            'rs': gettext('Serbia'),
            'es': gettext('Spain'),
            'uk': gettext('United Kingdom'),
            'us': gettext('United States'),
            've': gettext('Venezuela')
        },

        DEJUS: gettext('Department of Justice, Rating, Titles and Qualification'),
        DEJUS_URL: 'http://www.mj.gov.br/classificacao',

        // The Persona unverified issuer origin. Used by login.js.
        persona_unverified_issuer: 'login.persona.org',

        // The string to suffix page titles with. Used by builder.js.
        title_suffix: 'Firefox Marketplace',

        // The hardcoded carrier. This is expected to be falsey or an object
        // in the form {name: 'foo', slug: 'bar'}
        carrier: null
    });
});
