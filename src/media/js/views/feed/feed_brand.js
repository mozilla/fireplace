define('views/feed/feed_brand',
    ['jquery', 'l10n', 'textoverflowclamp', 'utils', 'z'],
    function($, l10n, clamp, utils, z) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args) {
        var slug = args[0];
        builder.start('feed/feed_brand.html', {
            landing: true,
            slug: slug
        }).done(function() {
            var brand = builder.results.brand;
            if (brand) {
                builder.z('title', utils.translate(brand.name));
            }
        });

        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));
        builder.z('pagetitle', gettext('Editorial Brand Details'));
    };
});
