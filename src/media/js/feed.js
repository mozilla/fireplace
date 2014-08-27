/* This is a shared file between Fireplace and Transonic. */
define('feed',
    ['edbrands', 'l10n', 'models', 'nunjucks', 'underscore', 'utils_local'], function(edbrands, l10n, models, nunjucks, _, utils_local) {
    'use strict';
    var gettext = l10n.gettext;

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
                brand_id += '_' + app.slug;
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
