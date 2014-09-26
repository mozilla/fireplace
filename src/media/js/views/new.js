define('views/new',
    ['format', 'l10n', 'log', 'models', 'underscore', 'urls', 'utils'],
    function(format, l10n, log, models, _, urls, utils) {
    'use strict';

    var gettext = l10n.gettext;
    var console = log('new');

    var app_models = models('app');

    return function(builder, args, params) {
        var title = gettext('Fresh and New Apps');

        builder.z('type', 'root app-list new');
        builder.z('title', title);

        builder.start('app_list.html', {
            app_cast: app_models.cast,
            endpoint_name: 'new_popular_search',
            sort: 'reviewed',
            source: 'new',
            title: title
        });
    };
});
