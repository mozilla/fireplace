define('views/popular_apps',
    ['core/l10n', 'core/log', 'core/urls', 'core/utils'],
    function(l10n, log, urls, utils) {
    'use strict';
    var gettext = l10n.gettext;
    var console = log('popular');

    return function(builder, args, params) {
        var title = gettext('Popular Apps');

        builder.z('type', 'root app-list popular nav-apps');
        builder.z('title', title);

        builder.start('product_list.html', {
            productListType: 'popular',
            endpoint_name: 'search',
            listItemType: 'webapp',
            source: 'popular apps',
            title: title
        });
    };
});
