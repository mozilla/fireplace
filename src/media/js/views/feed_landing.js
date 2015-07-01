/*
    Shared feed landing view between Collections, Editorial Brands, Shelves.
*/
define('views/feed_landing',
    ['edbrands', 'core/l10n', 'core/utils', 'utils_local'],
    function(brands, l10n, utils, utilsLocal) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        var feedType = args[0];  // collection, editorial, or shelf.
        var slug = decodeURIComponent(args[1]);

        builder.z('type', 'leaf ' + feedType + '-landing');
        builder.z('title', gettext('Loading...'));
        utilsLocal.headerTitle(gettext('Collection Detail'));

        builder.start('feed/' + feedType + '.html', {
            landing: true,
            slug: slug
        });

        // Update page title once loaded.
        function updateTitle(data) {
            builder.z('title', utils.translate(data.name));
        }
        if (feedType == 'editorial') {
            builder.onload('brand', function(brand) {
                // Figure out the brand name via the type.
                builder.z('title',
                          brands.get_brand_type(brand.type, brand.apps.length));
            });
        } else if (feedType == 'collection') {
            builder.onload('feed-collection', updateTitle);
        } else if (feedType == 'shelf') {
            builder.onload('shelf', updateTitle);
        }
    };
});
