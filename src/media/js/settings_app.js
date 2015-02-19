define('settings_app',
    ['core/capabilities', 'core/l10n', 'core/settings', 'settings_local',
     'core/storage'],
    function(capabilities, l10n, settings, settings_local,
             storage) {
    var gettext = l10n.gettext;

    var base_settings = JSON.parse(document.body.getAttribute('data-settings') || '{}');

    // When in "preview mode", don't send the feature profile to the API.
    var param_blacklist = (
        window.location.search || '').indexOf('preview=true') > 0 ? ['pro'] : null;

    function offline_cache_enabled() {
        if (storage.getItem('offline_cache_disabled') || capabilities.phantom) {
            return false;
        }
        return window.location.search.indexOf('cache=false') === -1;
    }

    settings._extend({
        app_name: 'fireplace',
        init_module: 'main',
        default_locale: 'en-US',
        api_url: 'http://' + window.location.hostname,  // No trailing slash, please./
        local_html: document.body.hasAttribute('data-local-html'),  // Exists or not.

        package_version: null,

        // The version number for localStorage data. Bump when the schema for
        // storing data in localStorage changes.
        storage_version: '0',

        // The list of query string parameters that are not stripped when
        // removing navigation loops.
        param_whitelist: ['q', 'sort', 'cat'],

        // The list of query string parameters that are not replaced
        // reversing API URLs.
        api_param_blacklist: param_blacklist,

        // These are the only API endpoints that should be served from the CDN
        // (key: URL; value: max-age in seconds, but it's unused at the moment).
        api_cdn_whitelist: {
            '/api/v2/fireplace/search/': 60 * 3,  // 3 minutes
            '/api/v2/feed/get/': 6 * 60 * 60,  // 6 hours
            '/api/v2/services/config/site/': 60 * 3  // 3 minutes
        },

        // The list of models and their primary key mapping. Used by caching.
        model_prototypes: {
            'app': 'slug',
            'collection': 'slug',

            'feed-app': 'slug',
            'feed-brand': 'slug',
            'feed-collection': 'slug',
            'feed-shelf': 'slug',

            // Dummy prototypes to facilitate testing:
            'dummy': 'id',
            'dummy2': 'id'
        },

        // These are the only URLs that should be cached
        // (key: URL; value: TTL [time to live] in seconds).
        // Keep in mind that the cache is always refreshed asynchronously;
        // these TTLs apply to only when the app is first launched.
        offline_cache_whitelist: {
            '/api/v2/feed/get/': 60 * 60 * 24 * 7,  // 1 week
            '/api/v2/fireplace/consumer-info/': 60 * 60 * 24 * 7,  // 1 week
            '/api/v2/services/config/site/': 60 * 60 * 24 * 7  // 1 week
        },
        offline_cache_enabled: offline_cache_enabled,
        offline_cache_limit: 1024 * 1024 * 4,  // 4 MB

        // Error template paths. Used by builder.js.
        fragment_error_template: 'errors/fragment.html',
        pagination_error_template: 'errors/pagination.html',

        // Switches for features.
        payments_enabled: true,
        tracking_enabled: true,
        action_tracking_enabled: true,
        upsell_enabled: true,
        cache_rewriting_enabled: true,
        potatolytics_enabled: false,

        // Waffle switches from the server.
        switches: [],  // Updated after consumer-info is called.

        // Enabling this settings will mock compatibility with all apps.
        never_incompat: false,

        // The UA tracking ID for this app.
        ua_tracking_id: 'UA-36116321-6',
        tracking_section: 'Consumer',
        tracking_section_index: 3,

        NEWSLETTER_LANGUAGES: {
            'en': gettext('English'),
            'fr': gettext('French'),
            'de': gettext('German'),
            'hu': gettext('Hungarian'),
            'id': gettext('Indonesian'),
            'pl': gettext('Polish'),
            'pt-BR': gettext('Portuguese'),
            'ru': gettext('Russian'),
            'es': gettext('Spanish'),
        },

        // A data URI of the project logo (shown when logging in via Persona).
        persona_site_logo: base_settings.media_url + '/fireplace/img/logos/128.png',
        persona_tos: null,
        persona_privacy: null,

        // The Persona unverified issuer origin. Used by login.js.
        persona_unverified_issuer: 'login.persona.org',

        // How long to wait before giving up on loading Persona's include.js.
        persona_timeout: 30000,  // 30 seconds

        // URL to Persona's include.js.
        persona_shim_url: 'https://login.persona.org/include.js',

        // The string to suffix page titles with. Used by builder.js.
        title_suffix: 'Firefox Marketplace',

        // The hardcoded carrier. This is expected to be falsey or an object
        // in the form {name: 'foo', slug: 'bar'}
        carrier: null,

        iframe_installer_src: 'https://marketplace.firefox.com/iframe-install.html',
        iframe_potatolytics_src: 'https://marketplace.firefox.com/potatolytics.html',
        offline_msg: gettext('Sorry, you are currently offline. Please try again later.'),
    });

    settings._extend(settings_local);
});
