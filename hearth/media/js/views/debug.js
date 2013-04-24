define(
    ['buckets', 'cache', 'capabilities', 'notification', 'utils', 'z'],
    function(buckets, cache, capabilities, notification, utils, z) {
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
    }).on('click', '.cache-menu a', function(e) {
        e.preventDefault();
        var data = cache.get($(this).data('url'));
        data = JSON.stringify(data, null, '  ');
        $('#cache-inspector').html(utils.escape_(data));
    });

    return function debug_view(builder, args) {
        builder.start('debug.html', {
            cache: cache.raw,
            capabilities: capabilities,
            dbg: debugEnabled || 'no',
            profile: buckets.get_profile()
        });

        builder.z('type', 'leaf');
    };
});
