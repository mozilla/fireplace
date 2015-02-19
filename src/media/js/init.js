define('init',
    ['core/cache', 'core/init', 'core/log', 'document-register-element',
     'helpers_local', 'marketplace-elements', 'rewriters', 'routes',
     'settings_app'],
    function(cache, init, log, documentRegisterElement,
             helpers_local, elements, rewriters, routes,
             settingsApp) {

    log('init').log('dependencies loaded');

    rewriters.forEach(function(rewriter) {
        cache.addRewriter(rewriter);
    });

    // Put any code that needs to run to initialize the app here or in the
    // dependencies.

    log('init').log('done');
});
