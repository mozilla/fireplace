define('views/purchases', ['l10n', 'urls', 'z'],
    function(l10n, urls, z) {
    'use strict';

    var gettext = l10n.gettext;

    z.page.on('logged_in', function() {
        z.page.trigger('navigate', urls.reverse('purchases'));
    });

    return function(builder, args) {
        builder.start('user/purchases.html');

        builder.z('type', 'leaf');
        builder.z('title', gettext('My Apps'));
    };
});
