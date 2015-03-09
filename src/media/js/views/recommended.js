define('views/recommended',
    ['core/l10n', 'core/urls', 'core/z'],
    function(l10n, urls, z) {
    'use strict';
    var gettext = l10n.gettext;

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
            appListType: 'recommended',
            endpoint_name: 'recommended',
            require_user: true,
            title: title
        });
    };
});
