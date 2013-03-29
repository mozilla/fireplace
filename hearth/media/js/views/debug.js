define(
    ['capabilities'],
    function(capabilities) {
    'use strict';

    return function debug_view(builder, args) {
        console.log(capabilities);
        builder.start('debug.html', {capabilities: capabilities});

        builder.z('type', 'leaf');
    };
});
