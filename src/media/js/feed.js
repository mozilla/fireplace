/* This is a shared file between Fireplace and Transonic. */
define('feed',
    ['edbrands', 'l10n', 'models', 'nunjucks', 'underscore', 'utils_local'], function(edbrands, l10n, models, nunjucks, _, utils_local) {
    'use strict';
    var gettext = l10n.gettext;
    var ngettext = l10n.ngettext;

    /* Usage:
     * get_brand_type() => return a one-dimensional array of the brand types.
     * get_brand_type(type, 2) => return the brand name with its plural form if applicable.
     */
    function get_brand_type(cat, numApps) {
        if (!arguments.length) {
            cat = null;
            numApps = 1;
        }
        var brand_types = {
            'apps-for-albania': ngettext('App for Albania', 'Apps for Albania', {n: numApps}),
            'apps-for-argentina': ngettext('App for Argentina', 'Apps for Argentina', {n: numApps}),
            'apps-for-bangladesh': ngettext('App for Bangladesh', 'Apps for Bangladesh', {n: numApps}),
            'apps-for-brazil': ngettext('App for Brazil', 'Apps for Brazil', {n: numApps}),
            'apps-for-bulgaria': ngettext('App for Bulgaria', 'Apps for Bulgaria', {n: numApps}),
            'apps-for-chile': ngettext('App for Chile', 'Apps for Chile', {n: numApps}),
            'apps-for-china': ngettext('App for China', 'Apps for China', {n: numApps}),
            'apps-for-colombia': ngettext('App for Colombia', 'Apps for Colombia', {n: numApps}),
            'apps-for-costa-rica': ngettext('App for Costa Rica', 'Apps for Costa Rica', {n: numApps}),
            'apps-for-croatia': ngettext('App for Croatia', 'Apps for Croatia', {n: numApps}),
            'apps-for-czech-republic': ngettext('App for Czech Republic', 'Apps for Czech Republic', {n: numApps}),
            'apps-for-ecuador': ngettext('App for Ecuador', 'Apps for Ecuador', {n: numApps}),
            'apps-for-el-salvador': ngettext('App for El Salvador', 'Apps for El Salvador', {n: numApps}),
            'apps-for-france': ngettext('App for France', 'Apps for France', {n: numApps}),
            'apps-for-germany': ngettext('App for Germany', 'Apps for Germany', {n: numApps}),
            'apps-for-greece': ngettext('App for Greece', 'Apps for Greece', {n: numApps}),
            'apps-for-hungary': ngettext('App for Hungary', 'Apps for Hungary', {n: numApps}),
            'apps-for-india': ngettext('App for India', 'Apps for India', {n: numApps}),
            'apps-for-italy': ngettext('App for Italy', 'Apps for Italy', {n: numApps}),
            'apps-for-japan': ngettext('App for Japan', 'Apps for Japan', {n: numApps}),
            'apps-for-macedonia': ngettext('App for Macedonia', 'Apps for Macedonia', {n: numApps}),
            'apps-for-mexico': ngettext('App for Mexico', 'Apps for Mexico', {n: numApps}),
            'apps-for-montenegro': ngettext('App for Montenegro', 'Apps for Montenegro', {n: numApps}),
            'apps-for-nicaragua': ngettext('App for Nicaragua', 'Apps for Nicaragua', {n: numApps}),
            'apps-for-panama': ngettext('App for Panama', 'Apps for Panama', {n: numApps}),
            'apps-for-peru': ngettext('App for Peru', 'Apps for Peru', {n: numApps}),
            'apps-for-poland': ngettext('App for Poland', 'Apps for Poland', {n: numApps}),
            'apps-for-russia': ngettext('App for Russia', 'Apps for Russia', {n: numApps}),
            'apps-for-serbia': ngettext('App for Serbia', 'Apps for Serbia', {n: numApps}),
            'apps-for-south-africa': ngettext('App for South Africa', 'Apps for South Africa', {n: numApps}),
            'apps-for-spain': ngettext('App for Spain', 'Apps for Spain', {n: numApps}),
            'apps-for-uruguay': ngettext('App for Uruguay', 'Apps for Uruguay', {n: numApps}),
            'apps-for-venezuela': ngettext('App for Venezuela', 'Apps for Venezuela', {n: numApps}),
            'arts-entertainment': ngettext('Arts & Entertainment', 'Arts & Entertainment', {n: numApps}),
            'book': ngettext('Book', 'Books', {n: numApps}),
            'creativity': ngettext('Creativity', 'Creativity', {n: numApps}),
            'education': ngettext('Education', 'Education', {n: numApps}),
            'games': ngettext('Game', 'Games', {n: numApps}),
            'groundbreaking': ngettext('Groundbreaking', 'Groundbreaking', {n: numApps}),
            'health-fitness': ngettext('Health & Fitness', 'Health & Fitness', {n: numApps}),
            'hidden-gem': ngettext('Hidden Gem', 'Hidden Gems', {n: numApps}),
            'lifestyle': ngettext('Lifestyle', 'Lifestyle', {n: numApps}),
            'local-favorite': ngettext('Local Favorite', 'Local Favorites', {n: numApps}),
            'maps-navigation': ngettext('Maps & Navigation', 'Maps & Navigation', {n: numApps}),
            'music': ngettext('Music', 'Music', {n: numApps}),
            'mystery-app': ngettext('Mystery App!', 'Mystery Apps!', {n: numApps}),
            'news-weather': ngettext('News & Weather', 'News & Weather', {n: numApps}),
            'photo-video': ngettext('Photo & Video', 'Photo & Video', {n: numApps}),
            'shopping': ngettext('Shopping', 'Shopping', {n: numApps}),
            'social': ngettext('Social', 'Social', {n: numApps}),
            'sports': ngettext('Sports', 'Sports', {n: numApps}),
            'tools-time-savers': ngettext('Tools & Time Saver', 'Tools & Time Savers', {n: numApps}),
            'travel': ngettext('Travel', 'Travel', {n: numApps}),
            'work-business': ngettext('Work & Business', 'Work & Business', {n: numApps})
        };
        if (cat) {
            return brand_types[cat];
        }
        return Object.keys(brand_types);
    }

    var BRAND_LAYOUTS = {
        'grid': gettext('Grid Layout'),
        'list': gettext('List Layout'),
    };

    var BRAND_LAYOUTS_CHOICES = utils_local.items(BRAND_LAYOUTS);

    var BRAND_COLORS = [
        'ruby',
        'amber',
        'emerald',
        'topaz',
        'sapphire',
        'amethyst',
        'garnet'
    ];

    var FEEDAPP_ICON = 'icon';
    var FEEDAPP_IMAGE = 'image';
    var FEEDAPP_DESC = 'description';
    var FEEDAPP_QUOTE = 'quote';
    var FEEDAPP_PREVIEW = 'preview';

    var FEEDAPP_TYPES = {
        'icon': gettext('Icon'),
        'image': gettext('Background Image'),
        'description': gettext('Description'),
        'quote': gettext('Quote'),
        'preview': gettext('Screenshot'),
    };

    var COLL_PROMO = 'promo';
    var COLL_LISTING = 'listing';
    var COLL_OPERATOR = 'operator';

    var COLL_TYPES = {
        'promo': gettext('Promo Collection'),
        'listing': gettext('Listing Collection'),
    };

    function get_brand_color_class(brand) {
        /*
        Passed the JSON representation of an editorial brand, returns a random
        CSS class to be used to colorify that brand's display.
        */

        function identifier(brand) {
            // Generate a unique identifier from the brand.
            var brand_id = brand.type;
            _.each(brand.apps, function(app) {
                brand_id += '_' + app.slug
            });
            return brand_id;
        }

        function charcode_sum(str) {
            // Sum the charcodes of each character in a passed string.
            var sum = 0;
            for(var i = 0, length = str.length; i < length; i++) {
                sum += str.charCodeAt(i);
            }
            return sum;
        }

        function seeded_random(seed) {
            // Generate a seeded random float between 0 and 1 using the passed
            // integer as a seed.
            var rand = Math.sin(seed++) * 10000;
            return rand - Math.floor(rand);
        }

        var brand_id = identifier(brand);
        var seed = charcode_sum(brand_id);
        var random = seeded_random(seed);

        return BRAND_COLORS[Math.floor(random * BRAND_COLORS.length)];
    }

    function group_apps(apps) {
        // Breaks up a list of apps with group attributions into a list of
        // groups {'name': <str>, 'apps': <arr>}.
        if (!apps || !apps[0].group) {
            return apps;
        }

        var grouped_apps = [];
        var current_group = {
            name: apps[0].group,
            apps: []
        };

        for (var i = 0; i < apps.length; i++) {
            if (apps[i].group != current_group.name) {
                // New group.
                grouped_apps.push(current_group);
                current_group = {
                    name: apps[i].group,
                    apps: []
                };
            }
            current_group.apps.push(apps[i]);
        }
        grouped_apps.push(current_group);

        return grouped_apps;
    }

    var MAX_BRAND_APPS = 6;

    return {
        BRAND_TYPES: edbrands.BRAND_TYPES,
        BRAND_LAYOUTS: BRAND_LAYOUTS,
        BRAND_LAYOUTS_CHOICES: BRAND_LAYOUTS_CHOICES,
        COLL_PROMO: COLL_PROMO,
        COLL_LISTING: COLL_LISTING,
        COLL_OPERATOR: COLL_OPERATOR,
        COLL_TYPES: COLL_TYPES,
        FEEDAPP_ICON: FEEDAPP_ICON,
        FEEDAPP_IMAGE: FEEDAPP_IMAGE,
        FEEDAPP_DESC: FEEDAPP_DESC,
        FEEDAPP_QUOTE: FEEDAPP_QUOTE,
        FEEDAPP_PREVIEW: FEEDAPP_PREVIEW,
        FEEDAPP_TYPES: FEEDAPP_TYPES,
        cast_feed_app: models('feed-app').cast,
        cast_brand: models('feed-brand').cast,
        cast_collection: models('feed-collection').cast,
        cast_shelf: models('feed-shelf').cast,
        get_brand_color_class: get_brand_color_class,
        get_brand_type: edbrands.get_brand_type,
        group_apps: group_apps,
        MAX_BRAND_APPS: MAX_BRAND_APPS,
    };
});
