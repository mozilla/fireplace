define('views/feed/feed_shelf',
    ['jquery', 'l10n', 'textoverflowclamp', 'utils', 'z'],
    function($, l10n, clamp, utils, z) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.start('feed/feed_shelf.html', {
            slug: slug
        }).done(function() {
            var shelf = builder.results.shelf;
            if (shelf) {
                builder.z('title', utils.translate(shelf.name));
            }
        });

        builder.onload('shelf', function(data) {
            // Give him the clamps!
            clamp(document.querySelector('.shelf + .desc'), 7);
        });

        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Operator Shelf Details'));
    };
});
