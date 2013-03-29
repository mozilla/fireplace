define(
    ['capabilities', 'notification', 'z'],
    function(capabilities, 'z') {
    'use strict';

    z.doc.on('click', '#toggle-debug', function() {
        var debugEnabled = localStorage.getItem('debug-enabled');
        if (debugEnabled) {
            notification.notification({message: 'debug mode disabled', timeout: 1000});
            localStorage.setItem('debug-enabled', false);
        } else {
            notification.notification({message: 'debug mode disabled', timeout: 1000});
            localStorage.setItem('debug-enabled', true);
        }
    });

    return function debug_view(builder, args) {
        console.log(capabilities);
        builder.start('debug.html', {capabilities: capabilities});

        builder.z('type', 'leaf');
    };
});
