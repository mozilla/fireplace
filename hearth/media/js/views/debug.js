define(
    ['buckets', 'capabilities', 'notification', 'z'],
    function(buckets, capabilities, notification, z) {
    'use strict';

    var debugEnabled = localStorage.getItem('debug-enabled');
    var label = $(document.getElementById('debug-status'));
    z.doc.on('click', '#toggle-debug', function() {
        debugEnabled = localStorage.getItem('debug-enabled');
        if (debugEnabled === 'yes') {
            notification.notification({message: 'debug mode disabled', timeout: 1000});
            localStorage.setItem('debug-enabled', 'no');
            label.text('no');
        } else {
            notification.notification({message: 'debug mode enabled', timeout: 1000});
            localStorage.setItem('debug-enabled', 'yes');
            label.text('yes');
        }
    });

    return function debug_view(builder, args) {
        builder.start('debug.html', {
            capabilities: capabilities,
            dbg: debugEnabled || 'no',
            profile: buckets.get_profile()
        });

        builder.z('type', 'leaf');
    };
});
