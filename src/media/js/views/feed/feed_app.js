define('views/feed/feed_app',
    ['jquery', 'l10n', 'utils', 'z'],
    function($, l10n, utils, z) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('App Details'));

        var slug = args[0];
        builder.start('feed/feed_app.html', {
            landing: true,
            slug: slug
        });

        builder.onload('feed_app', function(feed_app) {
            builder.z('title', utils.translate(feed_app.app.name));
        });
    };
});
