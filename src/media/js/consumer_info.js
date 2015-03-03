/*
   Retrieve user region and carrier information.
   Depends on mobilenetwork as it sets the region/carrier from the SIM data.
   On a clean cache, the promise will block on the request.
   On subsequent page loads, the promise will resolve from the cache.
*/
define('consumer_info',
    ['core/defer', 'core/log', 'mobilenetwork', 'core/requests', 'core/settings', 'core/urls', 'core/user',
     'user_helpers', 'core/z'],
    function(defer, log, mobilenetwork, requests, settings, urls, user,
             user_helpers, z) {
    var logger = log('consumer_info');
    var already_had_region = !!user_helpers.region(undefined, true);

    function handleConsumerInfo(data) {
        if (!already_had_region) {
            // If we didn't already have a region, then the region returned
            // by consumerInfo is coming from geoip, store it.
            user_helpers.set_region_geoip(data.region);
        }
        if (user.logged_in()) {
           if (data.apps !== undefined) {
               user.update_apps(data.apps);
           }
           user.update_settings({
               enable_recommendations: data.enable_recommendations
           });
        }
    }

    function fetch(force) {
        var def = defer.Deferred();

        // If we don't already have a region, try looking in the body for
        // data-region and use that if present. It'd set by zamboni on the
        // index.html it serves.
        if (!already_had_region) {
            var body_region = z.body.data('region');
            if (body_region) {
                user_helpers.set_region_geoip(body_region);
                already_had_region = true;
            }
        }

        // We have to call the API when:
        // - User is logged out and we don't know the region already, or it's
        //   not valid (we need the region to do all other API calls)
        // - User is logged in (we need the installed/purchased/developed apps
        //   list, recommendation opt-out, possibly region as well)
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
