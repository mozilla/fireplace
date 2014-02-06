define('consumer_info',
       ['user_helpers', 'mobilenetwork', 'urls', 'requests', 'defer', 'log'],
       function(user_helpers, mobilenetwork, urls, requests, defer, log) {
    var logger = log('consumer_info');
    mobilenetwork.detectMobileNetwork();
    if (!user_helpers.region(undefined, true)) {
        logger.log('Retrieving consumer info.');
        var deferred = defer.Deferred();
        var consumerInfoRequest = requests.get(urls.api.url('consumer_info'));
        consumerInfoRequest.then(function(consumerInfo) {
            logger.log('Consumer info retrieved.');
            user_helpers.set_region_geoip(consumerInfo.region);
        }, function() {
            logger.error('Failed to retrieve consumer info.');
            user_helpers.set_region_geoip('restofworld');
        }).always(function() {
            deferred.resolve();
        });
        return deferred.promise();
    } else {
        logger.log('Consumer info already loaded.');
        return defer.Deferred().resolve().promise();
    }
});
