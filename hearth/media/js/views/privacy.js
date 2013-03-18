define('views/privacy', ['l10n'], function(l10n) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder) {
        builder.start('privacy.html');

        builder.z('type', 'leaf');
        builder.z('title', gettext('Privacy Policy'));
    };
});
