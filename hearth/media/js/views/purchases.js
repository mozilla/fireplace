define('views/purchases', ['l10n', 'urls', 'z'],
    function(l10n, urls, z) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args) {
        builder.start('user/purchases.html');

        builder.z('type', 'root');
        builder.z('reload_on_login', true);
        builder.z('title', gettext('My Apps'));
    };
});
