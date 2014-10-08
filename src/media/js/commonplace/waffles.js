/*
    Get Zamboni waffle switches and store it into the cache.
    On a clean cache, the promise will block on the request.
    On subsequent page loads, the promise will resolve from the cache.
*/
define('waffles', ['defer', 'requests', 'settings', 'urls'],
    function(defer, requests, settings, urls) {

    function fetch() {
        var def = defer.Deferred();
        requests.get(urls.api.url('waffles')).done(function(waffle) {
            settings.switches = waffle.switches || [];
        }).always(function() {
            def.resolve();
        });

        return def.promise();
    }

    return {
        'fetch': fetch,
        'promise': fetch(),
    };
});
