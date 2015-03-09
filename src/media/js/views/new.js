define('views/new',
    ['core/format', 'core/l10n', 'core/urls', 'core/utils'],
    function(format, l10n, urls, utils) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args, params) {
        var title = gettext('New');

        builder.z('type', 'root app-list new');
        builder.z('title', title);

        builder.start('app_list.html', {
            appListType: 'new',
            endpoint_name: 'search',
            sort: 'reviewed',
            title: title,
        });
    };
});
