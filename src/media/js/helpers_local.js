define('helpers_local',
    ['apps', 'categories', 'compatibility_filtering', 'content-ratings',
     'feed', 'format', 'helpers', 'models', 'nunjucks', 'regions', 'settings',
     'urls', 'user_helpers', 'utils_local', 'z'],
    function(apps, categories, compatibility_filtering, iarc,
             feed, format, base_helpers, models, nunjucks, regions, settings,
             urls, user_helpers, utils_local, z) {
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
    filters.date = function(date) {
        return new Date(date).toLocaleDateString();
    };

    filters.json = JSON.stringify;
    if (nunjucks.env) {
        // For damper when rendering templates outside builder.
        nunjucks.env.addFilter('json', JSON.stringify);
    }

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

    filters.shadeHex = function(color, percent) {
        // http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
        var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    };

    function has_installed(manifestURL) {
        return z.apps.indexOf(manifestURL) !== -1;
    }

    /* Global variables, provided in default context. */
    globals.CATEGORIES = categories;
    globals.DEVICE_CHOICES = compatibility_filtering.DEVICE_CHOICES;
    globals.feed = feed;
    globals.iarc_names = iarc.names;
    globals.NEWSLETTER_LANGUAGES = settings.NEWSLETTER_LANGUAGES;
    globals.REGIONS = regions.REGION_CHOICES_SLUG;
    globals.user_helpers = user_helpers;
    globals.PLACEHOLDER_ICON = urls.media('fireplace/img/icons/placeholder.png');
    globals.compatibility_filtering = compatibility_filtering;

    /* Helpers functions, provided in the default context. */
    function indexOf(arr, val) {
        return arr.indexOf(val);
    }

    function app_notices(app) {
        // App notices for the app detail page (e.g., not available,
        // works offline). Returns an array of gettext/classes.
        var notices = [];
        // Positive notices.
        if (app.is_offline) {
            notices.push([gettext('Works offline'), 'positive']);
        }
        // Negative notices.
        var incompat_notices = apps.incompat(app) || [];
        incompat_notices.forEach(function(notice) {
            notices.push([notice, 'negative']);
        });
        return notices;
    }

    var helpers = {
        app_incompat: apps.incompat,
        app_notices: app_notices,
        cast_app: models('app').cast,
        format: format.format,
        has_installed: has_installed,
        numberfmt: nunjucks.require('filters').numberfmt,
        indexOf: indexOf
    };

    for (var i in helpers) {
        // Put the helpers into the nunjucks global.
        if (helpers.hasOwnProperty(i)) {
            globals[i] = helpers[i];
        }
    }

    return helpers;
});
