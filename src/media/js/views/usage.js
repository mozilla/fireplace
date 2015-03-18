define('views/usage',
    ['core/l10n'],
    function(l10n) {
        'use strict';
        var gettext = l10n.gettext;

        return function(builder, args, params) {
            builder.z('type', 'leaf');
            builder.z('title', gettext('App Statistics'));
            builder.start('usage.html');
        };
    }
);
