define('views',
    ['builder', 'routes', 'underscore', 'utils', 'views/not_found'],
    function(builder, routes, _, utils, not_found) {

    routes = routes.map(function(route) {
        route.regexp = new RegExp(route.pattern);
        return route;
    });

    function match_route(url) {
        // Returns a 2-tuple: (view, [args]) or null

        var hashpos, qspos;
        // Strip the hash string
        if ((hashpos = url.indexOf('#')) >= 0) {
            url = url.substr(0, hashpos);
        }

        // Strip the query string
        if ((qspos = url.indexOf('?')) >= 0) {
            url = url.substr(0, qspos);
        }

        // Force a leading slash
        if (url[0] != '/') {
            url = '/' + url;
        }

        console.log('Routing', url);
        for (var i in routes) {
            var route = routes[i];
            if (route === undefined) continue;

            console.log('Testing route', route.regexp);
            var matches = route.regexp.exec(url);
            if (!matches)
                continue;

            console.log('Found route: ', route.view_name);
            try {
                return [route.view, _.rest(matches)];
            } catch(e) {
                console.error('Route matched but view not initialized!', e);
                return null;
            }

        }

        console.warn('Failed to match route for ' + url);
        return [not_found, null];
    }

    function build(view, args, params) {
        var bobj = builder.getBuilder();
        view(bobj, args, utils.getVars(), params);

        // If there were no requests, the page is ready immediately.
        bobj.finish();

        return bobj;
    }

    return {
        build: build,
        match: match_route,
        routes: routes
    };

});
