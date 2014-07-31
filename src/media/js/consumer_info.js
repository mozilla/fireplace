define('consumer_info',
    ['urls', 'user', 'user_helpers', 'requests', 'defer', 'log', 'settings'],
    function(urls, user, user_helpers, requests, defer, log, settings) {
    var logger = log('consumer_info');

    function fetch() {
        logger.log('Retrieving consumer info.');
        var already_had_region = !!user_helpers.region(undefined, true);
        var deferred = defer.Deferred();
        var consumerInfoRequest = requests.get(urls.api.url('consumer_info'));
        consumerInfoRequest.then(function(consumerInfo) {
            logger.log('Consumer info retrieved.');

            if (!already_had_region) {
                // If we didn't already have a region, then the region returned
                // by consumerInfo is coming from geoip, store it.
                user_helpers.set_region_geoip(consumerInfo.region);
            }
            if (user.logged_in() && consumerInfo.apps !== undefined) {
                user.update_apps(consumerInfo.apps);
            }
            settings.switches = (consumerInfo.waffle && consumerInfo.waffle.switches) || [];
            settings.fxa_auth_url = consumerInfo.fxa_auth_url;
            settings.fxa_auth_state = consumerInfo.fxa_auth_state;
        }, function() {
            logger.error('Failed to retrieve consumer info.');
            user_helpers.set_region_geoip('restofworld');
        }).always(function() {
            // Always resolve the promise, but only when everything is over.
            deferred.resolve();
        });
        return deferred.promise();
    }

    return {
        'fetch': fetch,
        'promise': fetch(),  // Call immediately and return the promise for consumption.
    };
});
