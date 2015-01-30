define('views/feed/collection',
    ['core/l10n', 'core/utils'],
    function(l10n, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));

        var slug = args[0];
        builder.start('feed/collection.html', {
            slug: slug
        });

        builder.onload('feed-collection', function(data) {
            builder.z('title', utils.translate(data.name));
        });
    };
});
