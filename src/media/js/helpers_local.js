define('helpers_local', ['feed', 'nunjucks', 'settings' 'user_helpers', 'utils_local', 'z'],
       function(feed, nunjucks, settings, user_helpers, utils_local, z) {
    var filters = nunjucks.require('filters');
    var globals = nunjucks.require('globals');

    globals.feed = feed;
    globals.iarc_names = iarc.names;
    globals.REGIONS = settings.REGION_CHOICES_SLUG;
    globals.user_helpers = user_helpers;

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

    filters.items = utils_local.items;

    // When we get a page back from legal docs stored on the CDN, we
    // need to rewrite them to work locally within a packaged version
    // of Marketplace.
    filters.rewriteCdnUrls = function(text){
        rewriteCdnUrlMappings.forEach(function(mapping){
            text = text.replace(mapping.pattern, mapping.replacement);
        });
        return text;
    };

    function has_installed(manifestURL) {
        return z.apps.indexOf(manifestURL) !== -1;
    }

    // Functions provided in the default context.
    var helpers = {
        has_installed: has_installed
    };

    // Put the helpers into the nunjucks global.
    for (var i in helpers) {
        if (helpers.hasOwnProperty(i)) {
            globals[i] = helpers[i];
        }
    }

    return helpers;
});
