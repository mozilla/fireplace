define('views/debug',
    ['buckets', 'cache', 'capabilities', 'log', 'notification', 'requests', 'settings', 'storage', 'utils', 'z'],
    function(buckets, cache, capabilities, log, notification, requests, settings, storage, utils, z) {
    'use strict';

    var label = $(document.getElementById('debug-status'));
    z.doc.on('click', '#clear-localstorage', function(e) {
        storage.clear();
        notification.notification({message: 'localStorage cleared', timeout: 1000});
    }).on('click', '.cache-menu a', function(e) {
        e.preventDefault();
        var data = cache.get($(this).data('url'));
        data = JSON.stringify(data, null, '  ');
        $('#cache-inspector').html(utils.escape_(data));
    }).on('click', '#submit-debug', function(e) {
        e.preventDefault();
        var data = {body: JSON.stringify({
            logs: log.all,
            persistent_logs: log.persistent.all,
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
            profile: buckets.get_profile(),
            recent_logs: recent_logs,
            persistent_logs: log.persistent.all,
            filter: log.filter
        });

        builder.z('type', 'leaf debug');
    };
});
