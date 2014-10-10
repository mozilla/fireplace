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

    function handleConsumerInfo(data) {
        var already_had_region = !!user_helpers.region(undefined, true);

        if (!already_had_region) {
            // If we didn't already have a region, then the region returned
            // by consumerInfo is coming from geoip, store it.
            user_helpers.set_region_geoip(data.region);
        }
        if (user.logged_in() && data.apps !== undefined) {
            user.update_apps(data.apps);
        }
    }

    function fetch() {
        var def = defer.Deferred();

        requests.get(urls.api.url('consumer_info')).then(handleConsumerInfo,
            function() {
                logger.error('Failed to retrieve consumer info.');
                user_helpers.set_region_geoip('restofworld');
            })
        .always(function() {
            def.resolve();
        });

        return def.promise();
    }

    return {
        'fetch': fetch,
        'promise': fetch(),
    };
});
