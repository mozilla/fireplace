define('views/terms', [], function() {
    'use strict';

    return function(builder) {
        builder.start('terms.html');

        builder.z('type', 'leaf');
        builder.z('title', 'Terms of Use...');  // No L10n for you!
    };
});
