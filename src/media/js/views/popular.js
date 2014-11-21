define('views/popular',
    ['l10n', 'log', 'urls', 'utils'],
    function(l10n, log, urls, utils) {
    'use strict';
    var gettext = l10n.gettext;
    var console = log('popular');

    return function(builder, args, params) {
        var title = gettext('Popular All Time');

        builder.z('type', 'root app-list popular');
        builder.z('title', title);

        builder.start('app_list.html', {
            endpoint_name: 'new_popular_search',
            source: 'popular',
            title: title
        });
    };
});
