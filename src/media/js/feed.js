/*
    Helpers for displaying the Feed.
*/
define('feed',
    ['collection_colors', 'edbrands', 'l10n', 'nunjucks', 'underscore',
     'utils_local'],
    function(colors, brands, l10n, nunjucks, _,
             utils_local) {
    'use strict';
    var gettext = l10n.gettext;

    function transformer(feedItem) {
        /* Given a feed item, attach some fields to help presentation logic. */
        // Attach types.
        if (feedItem.app) {
            feedItem.isApp = true;
            feedItem.itemType = 'app';
        } else if (feedItem.layout) {
            feedItem.isBrand = true;
            feedItem.itemType = 'brand';
        } else if (feedItem.carrier) {
            feedItem.isShelf = true;
            feedItem.itemType = 'shelf';
        } else {
            feedItem.isCollection = true;
            feedItem.itemType = 'collection';
        }

        // Attach feed item-specific stuff.
        switch (feedItem.itemType) {
            case 'app':
                switch (feedItem.type) {
                    case 'icon':
                        feedItem.isIcon = true;
                        break;
                    case 'image':
                        feedItem.isImage = true;
                        break;
                    case 'description':
                        feedItem.isDescription = true;
                        break;
                    case 'quote':
                        feedItem.isQuote = true;
                        break;
                    case 'preview':
                        feedItem.isPreview = true;
                        break;
                }
                feedItem.src = 'featured-app';
                break;
            case 'brand':
                feedItem.color = get_brand_color_class(feedItem);
                feedItem.name = brands.get_brand_type(feedItem.type, feedItem.apps.length);
                feedItem.src = 'branded-editorial-element';
                break;
            case 'collection':
                if (feedItem.type == 'promo') {
                    feedItem.isCollPromo = true;
                } else {
                    feedItem.isCollListing = true;
                }
                feedItem.src = 'collection-element';
                break;
            case 'shelf':
                feedItem.src = 'operator-shelf-element';
                break;
        }

        // Attach hex color (deprecated).
        feedItem.color = feedItem.color || 'sapphire';
        feedItem.inline_color = colors.COLLECTION_COLORS[feedItem.color];

        return feedItem;
    }

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

        var color_names = Object.keys(colors.COLLECTION_COLORS);
        return color_names[Math.floor(random * color_names.length)];
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

    return {
        group_apps: group_apps,
        transformer: transformer,
    };
});
