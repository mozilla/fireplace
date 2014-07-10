define('consumer_info',
    ['urls', 'requests', 'defer', 'log', 'settings'],
    function(urls, requests, defer, log, settings) {
    var logger = log('consumer_info');

    function fetch() {
        logger.log('Retrieving consumer info.');
        var deferred = defer.Deferred();
        var consumerInfoRequest = requests.get(urls.api.url('consumer_info'));
        consumerInfoRequest.then(function(consumerInfo) {
            logger.log('Consumer info retrieved.');
            deferred.resolve();
            settings.switches = (consumerInfo.waffle && consumerInfo.waffle.switches) || [];
            settings.fxa_auth_url = consumerInfo.fxa_auth_url;
            settings.fxa_auth_state = consumerInfo.fxa_auth_state;
        }, function() {
            logger.error('Failed to retrieve consumer info.');
        }).always(function() {
            deferred.resolve();
        });
        return deferred.promise();
    }

    return {
        'fetch': fetch,
        'promise': fetch(),  // Call immediately and return the promise for consumption.
    };
});
