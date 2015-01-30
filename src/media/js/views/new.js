define('views/new',
    ['core/format', 'core/l10n', 'core/log', 'core/urls', 'core/utils'],
    function(format, l10n, log, urls, utils) {
    'use strict';
    var gettext = l10n.gettext;
    var console = log('new');

    return function(builder, args, params) {
        var title = gettext('New');

        builder.z('type', 'root app-list new');
        builder.z('title', title);

        builder.start('app_list.html', {
            endpoint_name: 'new_popular_search',
            sort: 'reviewed',
            source: 'new',
            title: title
        });
    };
});
