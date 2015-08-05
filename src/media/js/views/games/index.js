define('views/games/index',
    ['core/l10n'],
    function(l10n) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args, params) {
        params = params || {};

        builder.z('title', '');
        builder.z('type', 'root games');

        builder.start('games/index.html');
    };
});
