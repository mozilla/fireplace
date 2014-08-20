define('views/feed/feed_brand',
    ['feed', 'jquery', 'l10n', 'utils', 'z'],
    function(feed, $, l10n, utils, z) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Editorial Brand Details'));

        var slug = args[0];
        builder.start('feed/feed_brand.html', {
            landing: true,
            slug: slug
        });

        builder.onload('brand', function(brand) {
            // Figure out the brand name via the type.
            builder.z('title', feed.get_brand_type(brand.type, brand.apps.length));
        });
    };
});
