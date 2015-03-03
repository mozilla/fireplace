define('views/debug',
    ['core/cache', 'core/capabilities', 'compatibility_filtering', 'core/log', 'core/models', 'core/notification', 'regions', 'core/requests', 'core/settings', 'core/storage', 'core/user', 'core/utils', 'core/z'],
    function(cache, capabilities, compatibility_filtering, log, models, notification, regions, requests, settings, storage, user, utils, z) {
    'use strict';

    var persistent_console_debug = log.persistent('debug', 'change');
    var persistent_console_network = log.persistent('mobilenetwork', 'change');

    var label = $(document.getElementById('debug-status'));
    z.doc.on('click', '#clear-localstorage', function(e) {
        storage.clear();
        notification.notification({message: 'localStorage cleared', timeout: 1000});

    }).on('click', '#enable-offline-cache', function() {
        storage.removeItem('offline_cache_disabled');
        persistent_console_debug.log('Offline cache enabled:', new Date());
        require('views').reload();
        notification.notification({message: 'Offline cache enabled', timeout: 1000});

    }).on('click', '#disable-offline-cache', function() {
        storage.setItem('offline_cache_disabled', 1);
        persistent_console_debug.log('Offline cache disabled:', new Date());
        require('views').reload();
        notification.notification({message: 'Offline cache disabled', timeout: 1000});

    }).on('click', '#clear-offline-cache', function() {
        cache.flush();
        // This actually flushes all model caches.
        models('app').flush();
        persistent_console_debug.log('Offline cache cleared:', new Date());
        notification.notification({message: 'Offline cache cleared', timeout: 1000});
        window.location.reload();

    }).on('click', '#clear-cookies', function() {
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
            profile: compatibility_filtering.feature_profile
        })};
        requests.post('https://ashes.paas.allizom.org/post_report', data).done(function(data) {
            notification.notification({
                message: 'ID: ' + data.id,
                timeout: 30000
            });
        });

    }).on('change', '#debug-page select[name=region]', function(e) {
        var val = $(this).val();
        var current_region = user.get_setting('region_override');
        if (current_region !== val) {
            persistent_console_network.log('Manual region override change:', current_region, '→', val);
        }
        user.update_settings({region_override: val});
        z.page.trigger('reload_chrome');
        notification.notification({message: 'Region updated to ' + (regions.REGION_CHOICES_SLUG[val] || '---')});

    }).on('change', '#debug-page select[name=carrier]', function(e) {
        var val = $(this).val();
        var current_carrier = user.get_setting('carrier_override');
        if (current_carrier !== val) {
            persistent_console_network.log('Manual carrier override change:', current_carrier, '→', val);
        }
        user.update_settings({carrier_override: val});
        z.page.trigger('reload_chrome');
        notification.notification({message: 'Carrier updated to ' + val});
    });

    return function(builder, args) {
        var recent_logs = log.get_recent(100);

        builder.start('debug.html', {
            carriers: require('mobilenetwork').carriers,
            cache: cache.raw,
            capabilities: capabilities,
            profile: compatibility_filtering.feature_profile,
            recent_logs: recent_logs,
            persistent_logs: log.persistent.all,
            filter: log.filter,
            request_cache: storage.getItem('request_cache') || {}
        });

        builder.z('type', 'leaf debug');
    };
});
