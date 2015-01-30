/*
    My Apps page.
*/
define('views/purchases', ['core/l10n', 'core/urls'], function(l10n, urls) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'root settings purchases');
        builder.z('title', gettext('My Apps'));
        builder.z('parent', urls.reverse('homepage'));

        builder.start('purchases.html', {
            endpoint_name: 'installed'
        });
    };
});
