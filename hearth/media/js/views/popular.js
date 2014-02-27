define('views/popular',
    ['l10n', 'log', 'models', 'underscore', 'urls', 'utils'],
    function(l10n, log, models, _, urls, utils) {
    'use strict';

    var gettext = l10n.gettext;
    var console = log('new');

    var app_models = models('app');

    return function(builder, args, params) {
        var title = gettext('Popular All Time');

        builder.z('type', 'root');
        builder.z('title', title);

        builder.start('app_list.html', {
            app_cast: app_models.cast,
            sort: 'reviewed',
            source: 'popular',
            title: title
        });
    };
});
