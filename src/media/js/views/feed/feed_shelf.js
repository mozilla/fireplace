define('views/feed/feed_shelf',
    ['jquery', 'isotope', 'l10n', 'utils', 'z'],
    function($, Isotope, l10n, utils, z) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Operator Shelf Details'));

        var slug = args[0];
        builder.start('feed/feed_shelf.html', {
            landing: true,
            slug: slug
        });

        builder.onload('shelf', function(shelf) {
            builder.z('title', utils.translate(shelf.name));

            // Masonry the apps around the feed element.
            var iso = new Isotope(document.querySelector('ul.feed'), {
                itemSelector: '.detail-item',
                layoutMode: 'masonry',
                masonry: {
                    columnWidth: 320,
                    gutter: 0,
                    isFitWidth: true
                }
            });
        });
    };
});
