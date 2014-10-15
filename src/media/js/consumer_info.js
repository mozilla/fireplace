/*
   Retrieve user region and carrier information.
   Depends on mobilenetwork as it sets the region/carrier from the SIM data.
   On a clean cache, the promise will block on the request.
   On subsequent page loads, the promise will resolve from the cache.
*/
define('consumer_info',
    ['defer', 'log', 'mobilenetwork', 'requests', 'settings', 'urls', 'user',
     'user_helpers'],
    function(defer, log, mobilenetwork, requests, settings, urls, user,
             user_helpers) {
    var logger = log('consumer_info');
    var already_had_region = !!user_helpers.region(undefined, true);

    function handleConsumerInfo(data) {
        if (!already_had_region) {
            // If we didn't already have a region, then the region returned
            // by consumerInfo is coming from geoip, store it.
            user_helpers.set_region_geoip(data.region);
        }
        if (user.logged_in() && data.apps !== undefined) {
            user.update_apps(data.apps);
        }
    }

    function fetch(force) {
        var def = defer.Deferred();

        // We have to call the API when:
        // - User is logged out and no SIM (we need the region)
        // - User is logged out and SIM doesn't provide a known region
        //   (again, we need the region)
        // - User logged in (we need the installed/purchased/developed apps
        //   list, possibly region as well)
        // - The caller is forcing us
        if (force || !already_had_region || user.logged_in()) {
            requests.get(urls.api.url('consumer_info')).then(
                handleConsumerInfo,
                function() {
                    logger.error('Failed to retrieve consumer info.');
                    user_helpers.set_region_geoip('restofworld');
                })
            .always(function() {
                def.resolve();
            });
        } else {
            // We don't need to call consumer_info, we already have everything
            // we need. Immediately resolve the deferred.
            def.resolve();
        }
        return def.promise();
    }

    return {
        'fetch': fetch,
        'promise': fetch(),
    };
});
