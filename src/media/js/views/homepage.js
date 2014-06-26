define('views/homepage',
    ['format', 'isotope', 'jquery', 'l10n', 'log', 'newsletter', 'textoverflowclamp', 'underscore', 'urls', 'utils', 'z'],
    function(format, isotope, $, l10n, log, newsletter, clamp, _, urls, utils, z) {
    'use strict';

    var console = log('homepage');
    var gettext = l10n.gettext;

    z.page.on('click', '.feed-brand .view-all', function() {
        $(this).hide().closest('.feed-brand').find('.app.hidden').show();
    });

    return function(builder, args, params) {
        params = params || {};

        builder.z('title', '');

        builder.z('type', 'root');
        builder.z('search', params.name);
        builder.z('title', params.name);

        if ('src' in params) {
            delete params.src;
        }

        builder.start('feed.html', {});

        builder.onload('feed-items', function() {
            var iso = new isotope(document.querySelector('.feed'), {
                itemSelector: '.feed-item-item',
                layoutMode: 'masonry',
                masonry: {
                    columnWidth: 300,
                    gutter: 18,
                    isFitWidth: false
                }
            });
        });
    };
});
