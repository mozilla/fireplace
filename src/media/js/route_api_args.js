define('route_api_args',
    ['compat_filter', 'core/router', 'user_helpers'],
    function(compatFilter, router, userHelpers) {

    router.api.addProcessor(function(endpoint) {
        var args = compatFilter.apiArgs(endpoint);
        args.region = userHelpers.region(undefined, true);
        args.carrier = userHelpers.carrier();
        return args;
    });
});
