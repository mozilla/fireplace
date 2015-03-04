define('route_api_args',
    ['compatibility_filtering', 'core/router', 'user_helpers'],
    function(compatibility_filtering, router, user_helpers) {

    router.api.addProcessor(function(endpoint) {
        // Ask compatibility_filtering module for the base args to use, then
        // add a few extra generic ones.
        var args = compatibility_filtering.api_args(endpoint);
        args.region = user_helpers.region(undefined, true);
        args.carrier = user_helpers.carrier();
        return args;
    });
});
