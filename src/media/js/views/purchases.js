define('views/purchases', ['l10n', 'linefit', 'urls'], function(l10n, linefit, urls) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.z('type', 'root settings purchases');
        builder.z('title', gettext('My Apps'));
        builder.z('parent', urls.reverse('homepage'));

        builder.start('user/purchases.html', {
            endpoint_name: 'installed'
        });
    };
});
