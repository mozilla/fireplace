define('views/popular',
    ['core/l10n', 'core/log', 'core/urls', 'core/utils'],
    function(l10n, log, urls, utils) {
    'use strict';
    var gettext = l10n.gettext;
    var console = log('popular');

    return function(builder, args, params) {
        var title = gettext('Popular');

        builder.z('type', 'root app-list popular');
        builder.z('title', title);

        builder.start('app_list.html', {
            appListType: 'popular',
            endpoint_name: 'search',
            source: 'popular',
            title: title
        });
    };
});
