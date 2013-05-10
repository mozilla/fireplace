define('views/debug',
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
    }).on('click', '#install-yulelog', function(e) {
        var origin = window.location.origin || (
            window.location.protocol + '//' + window.location.host);
        var request = window.navigator.mozApps.installPackage(origin + '/packaged.webapp', null);
        request.onerror = function(e) {
            console.error('Error installing app:', + request.error.name);
        };
        request.onsuccess = function(e) {
            console.log('Success installing app:', + request.result.manifest.name);
        };
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
