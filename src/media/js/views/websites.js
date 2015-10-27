define('views/websites',
    ['core/l10n', 'utils_local'],
    function(l10n, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        var title = gettext('Popular Sites');

        builder.z('type', 'root nav-websites');
        builder.z('title', title);
        utils.headerTitle(title);
        builder.start('app_list.html', {
            appListType: 'popular',
            endpoint_name: 'search',
            listItemType: 'website',
            source: 'popular websites',
            title: title
        });
    };
});
