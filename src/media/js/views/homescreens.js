define('views/homescreens',
    ['core/l10n', 'utils_local'],
    function(l10n, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        var title = gettext('Popular Homescreens');

        builder.z('type', 'root nav-homescreens');
        builder.z('title', title);
        utils.headerTitle(title);
        builder.start('product_list.html', {
            productListType: 'popularHomescreens',
            endpoint_name: 'search',
            listItemType: 'webapp',
            isHomescreenList: true,
            source: 'popular homescreens',
            title: title
        });
    };
});
