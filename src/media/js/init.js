define('init',
    ['compat_filter', 'core/cache', 'core/init', 'core/router',
     'document-register-element', 'helpers_local', 'rewriters',
     'route_api_args', 'user_helpers'],
    function(compatFilter, cache, init, router,
             documentRegisterElement, helpers_local, rewriters,
             userHelpers) {

    rewriters.forEach(function(rewriter) {
        cache.addRewriter(rewriter);
    });

    // Put code to initialize the app either here or in the dependencies.
});
