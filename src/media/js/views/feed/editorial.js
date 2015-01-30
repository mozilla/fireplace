define('views/feed/editorial',
    ['edbrands', 'core/l10n', 'core/utils'],
    function(brands, l10n, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'leaf');
        builder.z('title', gettext('Loading...'));

        var slug = args[0];
        builder.start('feed/editorial.html', {
            landing: true,
            slug: slug
        });

        builder.onload('brand', function(brand) {
            // Figure out the brand name via the type.
            builder.z('title',
                      brands.get_brand_type(brand.type, brand.apps.length));
        });
    };
});
