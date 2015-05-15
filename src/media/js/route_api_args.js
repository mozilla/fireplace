define('route_api_args',
    ['compat_filter', 'content_filter', 'core/router', 'core/settings',
     'user_helpers', 'underscore'],
    function(compatFilter, contentFilter, router, settings,
             userHelpers, _) {

    router.api.addProcessor(function(endpoint) {
        var args = compatFilter.apiArgs(endpoint);

        if (settings.meowEnabled) {
            args = _.extend(args, contentFilter.apiArgs(endpoint));
        }

        args.region = userHelpers.region(undefined, true);
        args.carrier = userHelpers.carrier();
        return args;
    });
});
