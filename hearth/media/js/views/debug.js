define('views/debug',
    ['buckets', 'cache', 'capabilities', 'log', 'notification', 'utils', 'z'],
    function(buckets, cache, capabilities, log, notification, utils, z) {
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
    }).on('click', '#clear-localstorage', function(e) {
        localStorage.clear();
        notification.notification({message: 'localStorage cleared', timeout: 1000});
    }).on('click', '.cache-menu a', function(e) {
        e.preventDefault();
        var data = cache.get($(this).data('url'));
        data = JSON.stringify(data, null, '  ');
        $('#cache-inspector').html(utils.escape_(data));
    });

    return function debug_view(builder, args) {
        var recent_logs = log.get_recent(100);

        builder.start('debug.html', {
            cache: cache.raw,
            capabilities: capabilities,
            dbg: debugEnabled || 'no',
            profile: buckets.get_profile(),
            recent_logs: recent_logs,
            filter: log.filter
        });

        builder.z('type', 'leaf');
    };
});
