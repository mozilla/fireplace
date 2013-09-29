define('views/debug',
    ['buckets', 'cache', 'capabilities', 'log', 'notification', 'requests', 'settings', 'storage', 'utils', 'z'],
    function(buckets, cache, capabilities, log, notification, requests, settings, storage, utils, z) {
    'use strict';

    var label = $(document.getElementById('debug-status'));
    z.doc.on('click', '#clear-localstorage', function(e) {
        storage.clear();
        notification.notification({message: 'localStorage cleared', timeout: 1000});
    }).on('click', '#clear-cookies', function(e) {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var e = cookies[i].indexOf('=');
            var name = e > -1 ? cookies[i].substr(0, e) : c[i];
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        notification.notification({message: 'cookies cleared', timeout: 1000});
    }).on('click', '#nukecounter', function(e) {
        storage.removeItem('newscounter');
        notification.notification({message: 'newscounter reset', timeout: 1000});
    }).on('click', '.cache-menu a', function(e) {
        e.preventDefault();
        var data = cache.get($(this).data('url'));
        data = JSON.stringify(data, null, '  ');
        $('#cache-inspector').html(utils.escape_(data));
    }).on('click', '#submit-debug', function(e) {
        e.preventDefault();
        var data = {body: JSON.stringify({
            app: settings.app_name,
            origin: window.location.protocol + '//' + window.location.host,

            logs: log.all,
            persistent_logs: log.persistent.all,
            capabilities: capabilities,
            settings: settings,
            report_version: 1.0,
            profile: buckets.get_profile()
        })};
        requests.post('https://ashes.paas.allizom.org/post_report', data).done(function(data) {
            notification.notification({
                message: 'ID: ' + data.id,
                timeout: 30000
            });
        });
    });

    return function(builder, args) {
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
