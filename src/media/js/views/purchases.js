/*
    My Apps page.
*/
define('views/purchases', ['core/l10n', 'utils_local'], function(l10n, utilsLocal) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        var title = gettext('My Apps');

        builder.z('type', 'leaf spoke-header settings sub_setting purchases');
        builder.z('title', title);
        utilsLocal.headerTitle(title);

        builder.start('purchases.html', {
            endpoint_name: 'installed'
        });
    };
});
