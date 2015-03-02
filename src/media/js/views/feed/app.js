define('views/feed/app',
    ['jquery', 'core/l10n', 'core/utils', 'core/z'],
    function($, l10n, utils, z) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));

        var slug = args[0];
        builder.start('feed/app.html', {
            landing: true,
            slug: slug
        });

        builder.onload('feed_app', function(feed_app) {
            builder.z('title', utils.translate(feed_app.app.name));
        });
    };
});
