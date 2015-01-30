define('views/credits', ['core/l10n'], function(l10n) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder) {
        builder.start('credits.html');

        builder.z('type', 'leaf');
        builder.z('title', gettext('Credits'));
    };
});
