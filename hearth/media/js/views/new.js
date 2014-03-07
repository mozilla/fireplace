define('views/new',
    ['format', 'jquery', 'l10n', 'log', 'models', 'underscore', 'urls', 'utils'],
    function(format, $, l10n, log, models, _, urls, utils) {
    'use strict';

    var gettext = l10n.gettext;
    var console = log('new');

    var app_models = models('app');

    return function(builder, args, params) {
        var title = gettext('Fresh and New Apps');

        builder.z('type', 'root');
        builder.z('title', title);

        builder.start('app_list.html', {
            app_cast: app_models.cast,
            sort: 'reviewed',
            source: 'new',
            title: title
        });
    };
});
