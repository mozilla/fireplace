define('urls',
    ['format', 'routes_api', 'routes_api_args', 'settings', 'user', 'utils'],
    function(format, api_endpoints, api_args, settings, user) {

    var group_pattern = /\(.+\)/;
    var optional_pattern = /(\(.*\)|\[.*\]|.)\?/g;
    var reverse = function(view_name, args) {
        args = args || [];
        for (var i in routes) {
            var route = routes[i];
            if (route.view_name != view_name)
                continue;

            // Strip the ^ and $ from the route pattern.
            var url = route.pattern.substring(1, route.pattern.length - 1);

            if (url.indexOf('?') !== -1) {
                url = url.replace(optional_pattern, '');
            }

            // Replace each matched group with a positional formatting placeholder.
            var pos = 0;
            while (group_pattern.test(url)) {
                url = url.replace(group_pattern, '{' + pos++ + '}');
            }

            // Check that we got the right number of arguments.
            if (args.length !== pos) {
                console.error('Expected ' + pos + ' args, got ' + args.length);
                throw new Error('Wrong number of arguments passed to reverse(). View: "' + view_name + '", Argument "' + args + '"');
            }

            return format.format(url, args);

        }
        console.error('Could not find the view "' + view_name + '".');
    };

    function _userArgs(func) {
        return function() {
            var out = func.apply(this, arguments);
            var args = api_args();
            if (user.logged_in()) {
                args._user = user.get_token();
            }
            var blacklist = settings.api_param_blacklist || [];
            for (var key in args) {
                if (!args[key] || blacklist.indexOf(key) !== -1) {
                    delete args[key];
                }
            }
            return require('utils').urlparams(out, args);
        };
    }

    function api(endpoint, args, params) {
        if (!(endpoint in api_endpoints)) {
            console.error('Invalid API endpoint: ' + endpoint);
            return '';
        }
        var url = settings.api_url + format.format(api_endpoints[endpoint], args || []);
        if (params) {
            return require('utils').urlparams(url, params);
        }
        return url;
    }

    function apiParams(endpoint, params) {
        return api(endpoint, [], params);
    }

    function media(path) {
        var media_url = settings.media_url;
        if (media_url[media_url.length - 1] !== '/') {
            media_url += '/';
        }
        if (path[0] === '/') {
            path = path.substr(1);
        }
        return media_url + path;
    }

    return {
        reverse: reverse,
        api: {
            url: _userArgs(api),
            params: _userArgs(apiParams),
            sign: _userArgs(function(url) {return url;}),
            unsigned: {
                url: api,
                params: apiParams
            }
        },
        media: media
    };
});
