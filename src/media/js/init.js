/*
    Contains things to initialize before we kick off the app.
    Exposes a promise that the `main` module should wait on.
*/
define('init',
    ['core/cache', 'core/init', 'document-register-element', 'helpers_local',
     'rewriters', 'routes', 'route_api_args', 'settings_app', 'templates'],
    function(cache, init, documentRegisterElement, helpers_local,
             rewriters, routes, routeApiArgs, settingsApp) {

    rewriters.forEach(function(rewriter) {
        cache.addRewriter(rewriter);
    });

    return init.ready;
});
