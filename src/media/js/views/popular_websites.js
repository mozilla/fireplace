define('views/popular_websites',
    ['core/l10n', 'utils_local'],
    function(l10n, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        var title = gettext('Popular Sites');

        builder.z('type', 'root popular site-categories nav-websites');
        builder.z('title', title);
        utils.headerTitle(title);
        builder.start('product_list.html', {
            productListType: 'popularWebsites',
            endpoint_name: 'search',
            listItemType: 'website',
            source: 'popular websites',
            title: title
        });
    };
});
