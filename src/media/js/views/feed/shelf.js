define('views/feed/shelf',
    ['l10n', 'utils'],
    function(l10n, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf shelf-landing');
        builder.z('title', gettext('Loading...'));

        var slug = args[0];
        builder.start('feed/shelf.html', {
            slug: slug
        });

        builder.onload('shelf', function(data) {
            builder.z('title', utils.translate(data.name));
        });
    };
});
