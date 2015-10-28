define('route_api_args',
    ['compat_filter', 'core/router', 'core/settings',
     'user_helpers', 'underscore'],
    function(compatFilter, router, settings,
             userHelpers, _) {

    router.api.addProcessor(function(endpoint) {
        var args = compatFilter.apiArgs(endpoint);

        args.region = userHelpers.region(undefined, true);
        args.carrier = userHelpers.carrier();
        return args;
    });
});
