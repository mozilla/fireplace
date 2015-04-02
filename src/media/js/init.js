/*
    Contains things to initialize before we kick off the app.
    core/init, routes, and settings_app should be among the first modules
    required.
    Exposes a promise that the `main` module should wait on.
*/
define('init',
    ['core/init', 'routes', 'settings_app', 'templates',
     'core/cache', 'document-register-element', 'route_api_args', 'rewriters'],
    function(init, routes, settingsApp, templates,
             cache, elements, routeApiArgs, rewriters) {

    rewriters.forEach(function(rewriter) {
        cache.addRewriter(rewriter);
    });

    return init.ready;
});
