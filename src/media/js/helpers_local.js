define('helpers_local', ['feed', 'models', 'nunjucks', 'settings' 'user_helpers', 'utils_local', 'z'],
       function(feed, models, nunjucks, settings, user_helpers, utils_local, z) {
    var filters = nunjucks.require('filters');
    var globals = nunjucks.require('globals');

    var rewriteCdnUrlMappings = [
        {
            name: 'Privacy Policy',
            pattern: /\/media\/docs\/privacy\/.+\.html/g,
            replacement: '/privacy-policy'
        },
        {
            name: 'Terms of Use',
            pattern: /\/media\/docs\/terms\/.+\.html/g,
            replacement: '/terms-of-use'
        }
    ];

    /* Register filters. */
    filters.items = utils_local.items;

    filters.rewriteCdnUrls = function(text){
        // When we get a page back from legal docs stored on the CDN, we
        // need to rewrite them to work locally within a packaged version
        // of Marketplace.
        var rewriteCdnUrlMappings = [
            {
                name: 'Privacy Policy',
                pattern: /\/media\/docs\/privacy\/.+\.html/g,
                replacement: '/privacy-policy'
            },
            {
                name: 'Terms of Use',
                pattern: /\/media\/docs\/terms\/.+\.html/g,
                replacement: '/terms-of-use'
            }
        ];
        rewriteCdnUrlMappings.forEach(function(mapping){
            text = text.replace(mapping.pattern, mapping.replacement);
        });
        return text;
    };

    function has_installed(manifestURL) {
        return z.apps.indexOf(manifestURL) !== -1;
    }

    /* Global variables, provided in default context. */
    globals.feed = feed;
    globals.iarc_names = iarc.names;
    globals.REGIONS = settings.REGION_CHOICES_SLUG;
    globals.user_helpers = user_helpers;

    /* Helpers functions, provided in the default context. */
    function indexOf(arr, val) {
        return arr.indexOf(val);
    }

    var helpers = {
        cast_app: models('app').cast
        has_installed: has_installed
        indexOf: indexOf,
    };

    for (var i in helpers) {
        // Put the helpers into the nunjucks global.
        if (helpers.hasOwnProperty(i)) {
            globals[i] = helpers[i];
        }
    }

    return helpers;
});
