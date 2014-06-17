define('views/homepage',
    ['format', 'jquery', 'l10n', 'log', 'models', 'newsletter', 'textoverflowclamp', 'underscore', 'urls', 'utils', 'z'],
    function(format, $, l10n, log, models, newsletter, clamp, _, urls, utils, z) {
    'use strict';

    var gettext = l10n.gettext;
    var console = log('homepage');

    var app_models = models('app');

    z.page.on('click', '.feed-brand .view-all', function() {
        $(this).hide().closest('.feed-brand').find('.app.hidden').show();
    });

    return function(builder, args, params) {
        params = params || {};

        builder.z('title', '');

        builder.z('type', 'root');
        builder.z('search', params.name);
        builder.z('title', params.name);

        if ('src' in params) {
            delete params.src;
        }

        builder.start('feed.html', {
            sort: params.sort,
            app_cast: app_models.cast
        });
    };
});
