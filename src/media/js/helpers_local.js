define('helpers_local',
    ['apps', 'buttons', 'categories', 'content_filter', 'compat_filter',
     'content-ratings', 'core/format', 'core/helpers', 'core/models',
     'core/nunjucks', 'core/settings', 'core/urls', 'core/utils', 'core/z',
     'feed', 'regions', 'tracking_events', 'user_helpers', 'utils_local'],
    function(apps, buttons, categories, contentFilter, compatFilter,
             iarc, format, base_helpers, models,
             nunjucks, settings, urls, utils, z,
             feed, regions, trackingEvents, user_helpers, utils_local) {
    var filters = nunjucks.require('filters');
    var globals = nunjucks.require('globals');

    // developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
    // toLocaleDateString() on FxAndroid and FxOS returns m/d/Y even if passing
    // custom locale + options! To not ship full re-implementation, use
    // Intl.DateTimeFormat(), which is equivalent, but only present if
    // underlying platform has full implementation. Else fall back to Y-m-d.
    // Pretty date format (e.g. Saturday, February 15, 2014) on desktop
    // Something more universal (2014-02-15) on phones.
    var dateFormat;
    if (typeof Intl !== 'undefined' &&
        typeof Intl.DateTimeFormat !== 'undefined') {
        var formatting = Intl.DateTimeFormat(utils.lang(), {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        dateFormat = formatting.format.bind(formatting);
    } else {
        dateFormat = function(date) {
            return [
                date.getFullYear(),
                padDate(date.getMonth() + 1),
                padDate(date.getDate()),
            ].join('-');
        };
    }

    function padDate(d) {
        return (d < 10) ? '0' + d : d;
    }

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
        return dateFormat(new Date(date));
    };

    filters.json = JSON.stringify;
    if (nunjucks.env) {
        // For damper when rendering templates outside builder.
        nunjucks.env.addFilter('json', JSON.stringify);
    }

    filters.items = utils_local.items;

    // Filter to mirror Array.prototype.slice;
    filters.sliceArray = function sliceArray(array, begin, end) {
        if (typeof begin === "undefined") {
            return array.slice();
        }
        if (typeof end === "undefined") {
            return array.slice(begin);
        }
        return array.slice(begin, end);
    };

    filters.fileSize = function(int) {
        var bytes = parseInt(int, 10);
        if (bytes === 0) {
            return '0';
        } else if (bytes < Math.pow(1024, 2)) {
            return +(bytes / 1024).toFixed(2) + ' KB';
        } else if (bytes < Math.pow(1024, 3)) {
            return +(bytes / Math.pow(1024, 2)).toFixed(2) + ' MB';
        } else {
            return +(bytes / Math.pow(1024, 3)).toFixed(2) + ' GB';
        }
    };

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

    /* Global variables, provided in default context. */
    globals.buttons = buttons;
    globals.CATEGORIES = categories;
    globals.DEVICE_CHOICES = compatFilter.DEVICE_CHOICES;
    globals.feed = feed;
    globals.iarc_names = iarc.names;
    globals.NEWSLETTER_LANGUAGES = settings.NEWSLETTER_LANGUAGES;
    globals.user_helpers = user_helpers;
    globals.PLACEHOLDER_ICON = urls.media('fireplace/img/icons/placeholder.svg');
    globals.PLACEHOLDER_PREVIEW = urls.media('fireplace/img/icons/placeholder_preview.svg');
    globals.compat_filter = compatFilter;
    globals.trackingEvents = trackingEvents;

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
            notices.push([gettext('works offline'), 'positive']);
        }
        // Negative notices.
        var incompat_notices = apps.incompat(app) || [];
        incompat_notices.forEach(function(notice) {
            notices.push([notice, 'negative']);
        });
        return notices;
    }

    function getReviewId(resourceUri) {
        // Get review ID from resource URI.
        return resourceUri.match(/(\d+)\/$/)[1];
    }

    function htmldir() {
        return document.documentElement.dir;
    }

    var GAME_CATEGORIES = {
        'featured-game-adventure': gettext('Adventure Game'),
        'featured-game-action': gettext('Action Game'),
        'featured-game-puzzle': gettext('Puzzle Game'),
        'featured-game-strategy': gettext('Strategy Game')
    };
    function getGameCategory(game) {
        var categories = game.tags || game.keywords;
        if (!categories) {
            return;
        }
        for (var i = 0; i < categories.length; i++) {
            if (categories[i] in GAME_CATEGORIES) {
                return GAME_CATEGORIES[categories[i]];
            }
        }
    }

    var helpers = {
        apps: apps,
        app_notices: app_notices,
        appOrWebsite: function(obj) {
            return obj.manifest_url ? 'app' : 'website';
        },
        contentFilter: contentFilter,
        cast_app: models('app').cast,
        fileSize: filters.fileSize,
        getGameCategory: getGameCategory,
        htmldir: htmldir,
        format: format.format,
        getReviewId: getReviewId,
        numberfmt: nunjucks.require('filters').numberfmt,
        indexOf: indexOf,
        settings: settings
    };

    for (var i in helpers) {
        // Put the helpers into the nunjucks global.
        if (helpers.hasOwnProperty(i)) {
            globals[i] = helpers[i];
        }
    }

    return helpers;
});
