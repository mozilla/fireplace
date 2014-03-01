define('consumer_info',
    ['user', 'user_helpers', 'mobilenetwork', 'urls', 'requests', 'defer', 'log'],
    function(user, user_helpers, mobilenetwork, urls, requests, defer, log) {

    var logger = log('consumer_info');

    function fetch(force) {
        var already_have_region = false;

        if (!force) {
            // If we aren't forcing, check whether we actually need consumer
            // info. If we already have a region, we don't. Because we depend
            // on mobilenetwork, region should already have been detected
            // from the SIM at this point.
            already_have_region = user_helpers.region(undefined, true);
        }

        if (force || !already_have_region) {
            logger.log('Retrieving consumer info.' + (force ? ' (forced)' : ''));
            var deferred = defer.Deferred();
            var consumerInfoRequest = requests.get(urls.api.url('consumer_info'));
            consumerInfoRequest.then(function(consumerInfo) {
                logger.log('Consumer info retrieved.' + (force ? ' (forced)' : ''));
                user_helpers.set_region_geoip(consumerInfo.region);
                if (user.logged_in() && consumerInfo.apps !== undefined) {
                    user.update_apps(consumerInfo.apps);
                }
            }, function() {
                logger.error('Failed to retrieve consumer info.');
                user_helpers.set_region_geoip('restofworld');
            }).always(function() {
                deferred.resolve();
            });
            return deferred.promise();
        } else {
            logger.log('Consumer info already loaded and not forced.');
            return defer.Deferred().resolve().promise();
        }
    }

    return {
        'fetch': fetch,
        'promise': fetch(),  // Call immediately and return the promise for consumption.
    };
});
