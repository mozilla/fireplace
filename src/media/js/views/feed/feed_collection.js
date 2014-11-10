define('views/feed/feed_collection', ['jquery', 'l10n', 'utils', 'utils_local', 'z'],
    function($, l10n, utils, utils_local, z) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Collection Details'));

        var slug = args[0];
        builder.start('feed/feed_collection.html', {
            slug: slug
        });

        builder.onload('feed-collection', function(feed_collection) {
            builder.z('title', utils.translate(feed_collection.name));
            utils_local.initSalvattore(
                document.querySelector('.collection-landing [data-columns]'));
        });
    };
});
