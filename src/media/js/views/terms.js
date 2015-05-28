define('views/terms',
    ['core/l10n', 'utils_local'],
    function(l10n, utilsLocal) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder) {
        builder.start('terms.html');

        builder.z('type', 'leaf');
        var title = gettext('Terms of Use');
        builder.z('title', title);
        utilsLocal.headerTitle(title);
    };
});
