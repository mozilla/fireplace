define('views/debug',
    ['buckets', 'cache', 'capabilities', 'log', 'notification', 'requests', 'settings', 'storage', 'utils', 'z'],
    function(buckets, cache, capabilities, log, notification, requests, settings, storage, utils, z) {
    'use strict';

    var debugEnabled = storage.getItem('debug-enabled');
    var label = $(document.getElementById('debug-status'));
    z.doc.on('click', '#toggle-debug', function() {
        debugEnabled = storage.getItem('debug-enabled');
        if (debugEnabled === 'yes') {
            notification.notification({message: 'debug mode disabled', timeout: 1000});
            storage.setItem('debug-enabled', 'no');
            label.text('no');
        } else {
            notification.notification({message: 'debug mode enabled', timeout: 1000});
            storage.setItem('debug-enabled', 'yes');
            label.text('yes');
        }
    }).on('click', '#clear-localstorage', function(e) {
        storage.clear();
        notification.notification({message: 'localStorage cleared', timeout: 1000});
    }).on('click', '.cache-menu a', function(e) {
        e.preventDefault();
        var data = cache.get($(this).data('url'));
        data = JSON.stringify(data, null, '  ');
        $('#cache-inspector').html(utils.escape_(data));
    }).on('click', '#install-yulelog', function(e) {
        e.preventDefault();
        var origin = window.location.origin || (
            window.location.protocol + '//' + window.location.host);
        window.navigator.mozApps.installPackage(origin + '/packaged.webapp');
        notification.notification({message: 'yulelog installed (sorry, krupa, everything is the worst)', timeout: 1000});
    }).on('click', '#submit-debug', function(e) {
        e.preventDefault();
        var data = {body: JSON.stringify({
            logs: log.all,
            capabilities: capabilities,
            profile: buckets.get_profile(),
            settings: settings,
            report_version: 1.0
        })};
        requests.post('https://ashes.paas.allizom.org/post_report', data).done(function(data) {
            notification.notification({
                message: 'ID: ' + data.id,
                timeout: 30000
            });
        });
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

        builder.z('type', 'leaf debug');
    };
});
