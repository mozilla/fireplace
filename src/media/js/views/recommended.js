define('views/recommended',
    ['core/l10n', 'core/log', 'core/models', 'core/urls', 'core/z'],
    function(l10n, log, models, urls, z) {
    'use strict';

    var gettext = l10n.gettext;
    var console = log('recommended');

    var app_models = models('app');

    z.page.on('before_logout', function() {
        if (window.location.pathname === urls.reverse('recommended')) {
            // Logged out users shouldn't see /recommended; redirect them.
            z.page.trigger('navigate', [urls.reverse('homepage')]);
        }
    });

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
