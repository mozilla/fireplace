define('views/terms', ['core/l10n'], function(l10n) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder) {
        builder.start('terms.html');

        builder.z('type', 'leaf');
        var title = gettext('Terms of Use');
        builder.z('title', title);
        builder.z('header-title', title);
    };
});
