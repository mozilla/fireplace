define('views/feed/feed_collection',
    ['jquery', 'isotope', 'l10n', 'utils', 'z'],
    function($, isotope, l10n, utils, z) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.start('feed/feed_collection.html', {
            slug: slug
        }).done(function() {
            var collection = builder.results.feed_collection;
            if (collection) {
                builder.z('title', utils.translate(collection.name));
            }
        });

        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Collection Details'));

        builder.onload('feed-collection', function() {
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
