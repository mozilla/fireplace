define('views/new_websites',
    ['core/l10n', 'utils_local'],
    function(l10n, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        var title = gettext('New Sites');

        builder.z('type', 'root new site-categories nav-websites');
        builder.z('title', title);
        utils.headerTitle(title);
        builder.start('product_list.html', {
            productListType: 'newWebsites',
            endpoint_name: 'search',
            listItemType: 'website',
            source: 'new websites',
            sort: 'reviewed',
            title: title
        });
    };
});
