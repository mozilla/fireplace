define('views/usage',
    ['l10n'],
    function(l10n) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args, params) {
        builder.start('usage.html');
        builder.z('type', 'leaf');
        builder.z('title', gettext('App Statistics'));
    };
});

