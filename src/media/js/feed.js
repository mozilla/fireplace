/*
    Helpers for displaying the Feed.
*/
define('feed',
    ['collection_colors', 'edbrands', 'core/l10n', 'core/nunjucks',
     'core/settings', 'core/urls', 'core/utils',  'core/z', 'feed_websites',
     'tracking_events', 'underscore', 'utils_local'],
    function(colors, brands, l10n, nunjucks,
             settings, urls, utils, z, feedWebsites,
             trackingEvents, _, utils_local) {
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
            feedItem.itemTypeSlug = 'editorial';
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
                feedItem.src = trackingEvents.SRCS.featuredApp;
                break;
            case 'brand':
                feedItem.name = brands.get_brand_type(feedItem.type, feedItem.apps.length);
                feedItem.src = trackingEvents.SRCS.brand;
                feedItem.isGridLayout = feedItem.layout == 'grid';
                feedItem.isListLayout = feedItem.layout == 'listing';
                feedItem.maxApps = feedItem.isGridLayout ? 6 : 4;
                feedItem.color = getBrandColorClass(feedItem);
                break;
            case 'collection':
                if (feedItem.type == 'promo') {
                    feedItem.isCollPromo = true;
                } else {
                    feedItem.isCollListing = true;
                }
                feedItem.src = trackingEvents.SRCS.collection;
                feedItem.maxApps = 4;
                break;
            case 'shelf':
                feedItem.src = trackingEvents.SRCS.shelf;
                break;
        }

        // Some cases, we want to persist the previous src, like Desktop Promo.
        if (utils.getVars().src in trackingEvents.PERSISTENT_SRCS) {
            feedItem.src = utils.getVars().src;
        }

        // Get the Feed detail page URL for the item.
        if (feedItem.isApp) {
            feedItem.landingUrl = urls.reverse('app', [feedItem.app.slug]);
        } else {
            feedItem.landingUrl = urls.reverse('feed_landing', [
                feedItem.itemTypeSlug || feedItem.itemType,
                feedItem.slug
            ]);
        }
        feedItem.landingUrl = utils.urlparams(feedItem.landingUrl, {
            src: feedItem.src
        });

        // Attach hex color (deprecated).
        feedItem.color = feedItem.color || 'sapphire';
        feedItem.inline_color = colors.COLLECTION_COLORS[feedItem.color];

        // TODO: deserialize image_url (bug 1148509).
        if (feedItem.isApp && feedItem.preview) {
            feedItem.preview.thumbnail_url = feedItem.preview.thumbnail_url
                                                     .replace(/\/thumbs\//,
                                                              '/full/');
        }

        return feedItem;
    }

    function getBrandColorClass(brand) {
        /*
        Passed the JSON representation of an editorial brand, returns a random
        CSS class to be used to colorify that brand's display.
        */
        function identifier(brand) {
            // Generate a unique identifier from the brand using its apps.
            var brand_id = brand.type;

            var i = 0;
            while(i < 4 && i < brand.apps.length - 1) {
                // Only do 4 apps at most since Feed vs Landing app count.
                brand_id += '_' + brand.apps[i].slug;
                i++;
            }
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

    // MOW-related feed items.
    if (settings.meowEnabled && settings.homepageWebsitesEnabled) {
        z.page.on('loaded reloaded_chrome', function(evt) {
            feedWebsites.tabs.init(evt);
            feedWebsites.carousel.init(evt);
        })
        .on('click', '.feed-item-website-tabs button', function(evt) {
            feedWebsites.tabs.change(evt);
        })
        .on('click', '.feed-item-website-carousel-next', function(evt) {
            feedWebsites.carousel.change(evt);
        });
    }

    return {
        group_apps: group_apps,
        transformer: transformer,
    };
});
