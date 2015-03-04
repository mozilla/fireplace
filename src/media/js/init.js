define('init',
    ['compatibility_filtering', 'core/cache', 'core/init', 'core/log',
     'core/router', 'document-register-element', 'helpers_local', 'rewriters',
     'route_api_args', 'user_helpers'],
    function(compatibility_filtering, cache, init, log,
             router, documentRegisterElement, helpers_local, rewriters,
             user_helpers) {

    log('init').log('dependencies loaded');

    rewriters.forEach(function(rewriter) {
        cache.addRewriter(rewriter);
    });

    // Put any code that needs to run to initialize the app here or in the
    // dependencies.

    log('init').log('done');
});
