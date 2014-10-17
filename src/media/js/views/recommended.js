define('views/recommended',
    ['l10n', 'log', 'models', 'underscore', 'urls', 'utils'],
    function(l10n, log, models, _, urls, utils) {
    'use strict';

    var gettext = l10n.gettext;
    var console = log('recommended');

    var app_models = models('app');

    return function(builder, args, params) {
        var title = gettext('Recommended');

        builder.z('type', 'root app-list recommended');
        builder.z('title', title);

        builder.start('app_list.html', {
            app_cast: app_models.cast,
            endpoint_name: 'recommended',
            require_user: true,
            source: 'reco',
            title: title
        });
    };
});
