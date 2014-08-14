define('views/feed/feed_shelf',
    ['jquery', 'isotope', 'l10n', 'utils', 'z'],
    function($, isotope, l10n, utils, z) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.start('feed/feed_shelf.html', {
            landing: true,
            slug: slug
        }).done(function() {
            var shelf = builder.results.shelf;
            if (shelf) {
                builder.z('title', utils.translate(shelf.name));
            }
        });

        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Operator Shelf Details'));

        builder.onload('shelf', function() {
            var iso = new isotope(document.querySelector('ul.feed'), {  /*jshint ignore:line*/
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
