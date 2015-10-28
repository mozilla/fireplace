define('carrier',
    ['consumer_info', 'core/defer', 'core/requests', 'core/settings',
     'core/storage', 'core/urls', 'core/user', 'underscore', 'user_helpers'],
    function(consumerInfo, defer, requests, settings, storage,
             urls, user, _, userHelpers) {
    'use strict';

    function notInstalled(app) {
        return !user.has_installed(app.id);
    }

    function wait(time) {
        var def = defer.Deferred();
        setTimeout(function() {
            def.resolve();
        }, time);
        return def;
    }

    var carrier = userHelpers.carrier();
    var region = userHelpers.region();
    var STORAGE_KEY = 'late-customization-complete';
    var apiResponse;

    if (settings.lateCustomizationEnabled && carrier && region &&
            !isLateCustomizationCompleted()) {
        apiResponse = requests.get(urls.api.url('late-customization', [], {
            carrier: carrier,
            region: region,
        }));
    } else {
        apiResponse = defer.Deferred().reject();
    }

    var allApps = apiResponse.then(function(response) {
        return response.objects;
    });

    function hasInstallableApps() {
        // We need to wait for a bit each time this is called because the
        // install-success event fires before the installed apps list is
        // updated.
        return defer
            .when(allApps, consumerInfo.promise, wait(20))
            .then(function(apps) {
                var installable = _.some(apps, notInstalled);
                if (!installable) {
                    completeLateCustomization();
                }
                return installable;
            });
    }

    function completeLateCustomization() {
        storage.setItem(STORAGE_KEY, true);
    }

    function isLateCustomizationCompleted() {
        return storage.getItem(STORAGE_KEY);
    }

    return {
        hasInstallableApps: hasInstallableApps,
        isLateCustomizationCompleted: isLateCustomizationCompleted,
        completeLateCustomization: completeLateCustomization,
    };

});
