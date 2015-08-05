define('views/games/index', [], function() {
    'use strict';

    return function(builder, args, params) {
        params = params || {};

        builder.z('title', '');
        builder.z('type', 'root games');

        builder.start('games/index.html');
    };
});
