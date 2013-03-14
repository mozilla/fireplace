define('views/privacy', [], function() {
    'use strict';

    return function(builder) {
        builder.start('privacy.html');

        builder.z('type', 'leaf');
        builder.z('title', 'Privacy Policy');  // No L10n for you!
    };
});
