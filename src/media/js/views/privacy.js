define('views/privacy',
    ['core/l10n', 'utils_local'],
    function(l10n, utilsLocal) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder) {
        var title = gettext('Privacy Policy');

        builder.start('privacy.html');
        builder.z('type', 'leaf');
        builder.z('title', title);
        utilsLocal.headerTitle(title);
    };
});
