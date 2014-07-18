define('views/terms', ['l10n'], function(l10n) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder) {
        builder.start('terms.html');

        builder.z('type', 'leaf');
        builder.z('title', gettext('Terms of Use'));
    };
});
