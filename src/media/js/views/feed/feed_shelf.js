define('views/feed/feed_shelf',
    ['jquery', 'l10n', 'utils', 'z'],
    function($, l10n, utils, z) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Operator Shelf Details'));

        var slug = args[0];
        builder.start('feed/feed_shelf.html', {
            slug: slug
        });

        builder.onload('shelf', function(data) {
            builder.z('title', utils.translate(data.name));
        });
    };
});
