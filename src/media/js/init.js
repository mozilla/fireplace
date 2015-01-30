define('init',
    ['core/cache', 'core/init', 'rewriters', 'routes', 'settings_app',
     'settings_local'],
    function(cache, init, rewriters, routes, settingsApp, settingsLocal) {

    rewriters.forEach(function(rewriter) {
        cache.addRewriter(rewriter);
    });

    // Put any code that needs to run to initialize the app here or in the
    // dependencies.
});
