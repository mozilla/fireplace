define('views/debug',
    ['core/cache', 'core/capabilities', 'carriers', 'compat_filter',
     'core/log', 'core/models', 'core/notification', 'core/requests',
     'core/settings', 'core/storage', 'core/user', 'core/utils', 'core/z',
     'regions', 'utils_local', 'underscore'],
    function(cache, capabilities, carriers, compatFilter,
             log, models, notification, requests,
             settings, storage, user, utils, z,
             regions, utilsLocal, _) {
    'use strict';

    var persistent_console_debug = log.persistent('debug', 'change');
    var persistent_console_network = log.persistent('mobilenetwork', 'change');

    var label = $(document.getElementById('debug-status'));

    z.page.on('click', '#clear-localstorage', function(e) {
        storage.clear();
        notification.notification({message: 'localStorage cleared',
                                   timeout: 1000});
    })

    .on('click', '#enable-addons', function() {
        storage.setItem('always_show_extensions', 1);
        settings.addonsEnabled = true;
        window.location.href = '/';
    })

    .on('click', '#disable-addons', function() {
        storage.removeItem('always_show_extensions');
        window.location.href = '/';
    })

    .on('click', '#enable-offline-cache', function() {
        storage.removeItem('offline_cache_disabled');
        persistent_console_debug.log('Offline cache enabled:', new Date());
        require('views').reload();
        notification.notification({message: 'Offline cache enabled',
                                   timeout: 1000});
    })

    .on('click', '#disable-offline-cache', function() {
        storage.setItem('offline_cache_disabled', 1);
        persistent_console_debug.log('Offline cache disabled:', new Date());
        require('views').reload();
        notification.notification({message: 'Offline cache disabled',
                                   timeout: 1000});
    })

    .on('click', '#clear-offline-cache', function() {
        cache.flush();
        // This actually flushes all model caches.
        models('app').flush();
        persistent_console_debug.log('Offline cache cleared:', new Date());
        notification.notification({message: 'Offline cache cleared',
                                   timeout: 1000});
        window.location.reload();

    })

    .on('click', '#clear-cookies', function() {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var e = cookies[i].indexOf('=');
            var name = e > -1 ? cookies[i].substr(0, e) : c[i];
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        notification.notification({message: 'Cookies cleared', timeout: 1000});
    })

    .on('click', '.cache-menu a', function(e) {
        e.preventDefault();
        var data = cache.get($(this).data('url'));
        data = JSON.stringify(data, null, '  ');
        $('#cache-inspector').html(utils.escape_(data));
    })

    .on('click', '#submit-debug', function(e) {
        e.preventDefault();
        var data = {body: JSON.stringify({
            app: settings.app_name,
            origin: window.location.protocol + '//' + window.location.host,
            logs: log.all,
            persistent_logs: log.persistent.all,
            capabilities: capabilities,
            settings: settings,
            report_version: 1.0,
            profile: compatFilter.featureProfile
        })};

        var ashesUrl = 'https://ashes.paas.allizom.org/post_report';
        requests.post(ashesUrl, data).done(function(data) {
            notification.notification({message: 'Logs uploaded: ' + data.id,
                                       timeout: 30000});
        });
    })

    .on('change', '#debug-region', function(e) {
        var val = $(this).val();
        var current_region = user.get_setting('region_override');
        if (current_region !== val) {
            persistent_console_network.log('Manual region override change:',
                                           current_region, '→', val);
        }
        user.update_settings({region_override: val});
        z.page.trigger('reload_chrome');
        notification.notification({
            message: 'Region updated to ' +
                     (regions.REGION_CHOICES_SLUG[val] || '---')});
    })

    .on('change', '#debug-carrier', function(e) {
        var val = $(this).val();
        var current_carrier = user.get_setting('carrier_override');
        if (current_carrier !== val) {
            persistent_console_network.log('Manual carrier override change:',
                                           current_carrier, '→', val);
        }
        user.update_settings({carrier_override: val});
        z.page.trigger('reload_chrome');
        notification.notification({message: 'Carrier updated to ' + val});
    });

    function callIfFunction(val) {
        if (typeof(val) == 'function') {
            return val();
        }
        return val;
    }

    return function(builder, args) {
        builder.z('type', 'leaf debug');

        builder.start('debug.html', {
            cache: cache.raw,
            callIfFunction: callIfFunction,
            capabilities: capabilities,
            carriers: carriers.CARRIER_SLUGS.sort(),
            filter: log.filter,
            persistent_logs: log.persistent.all,
            profile: compatFilter.featureProfile,
            regions: _.sortBy(utilsLocal.items(regions.REGION_CHOICES_SLUG),
                function(r) {
                    return r[1];
                }
            ),
            recent_logs: log.get_recent(100),
            request_cache: storage.getItem('request_cache') || {}
        });
    };
});
