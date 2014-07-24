define('urls',
    ['format', 'log', 'routes_api', 'routes_api_args', 'settings', 'user', 'utils'],
    function(format, log, api_endpoints, api_args, settings, user, utils) {

    var console = log('urls');

    // The CDN URL is the same as the media URL but without the `/media/` path.
    if ('media_url' in settings) {
        var a = document.createElement('a');
        a.href = settings.media_url;
        settings.cdn_url = a.protocol + '//' + a.host;
        console.log('Using settings.media_url: ' + settings.media_url);
        console.log('Changed settings.cdn_url: ' + settings.cdn_url);
    } else {
        settings.cdn_url = settings.api_url;
        console.log('Changed settings.cdn_url to settings.api_url: ' + settings.api_url);
    }

    var group_pattern = /\([^\)]+\)/;
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
            _removeBlacklistedParams(args);
            return utils.urlparams(out, args);
        };
    }

    function _anonymousArgs(func) {
        return function() {
            var out = func.apply(this, arguments);
            var args = api_args();
            _removeBlacklistedParams(args);
            return utils.urlparams(out, args);
        };
    }

    function _removeBlacklistedParams(args) {
        var blacklist = settings.api_param_blacklist || [];
        for (var key in args) {
            if (!args[key] || blacklist.indexOf(key) !== -1) {
                delete args[key];
            }
        }
    }

    function api(endpoint, args, params) {
        if (!(endpoint in api_endpoints)) {
            console.error('Invalid API endpoint: ' + endpoint);
            return '';
        }

        var path = format.format(api_endpoints[endpoint], args || []);
        var url = apiHost(path) + path;

        if (params) {
            return utils.urlparams(url, params);
        }
        return url;
    }

    function apiParams(endpoint, params) {
        return api(endpoint, [], params);
    }

    function apiHost(path) {
        // If the API URL is already reversed, then here's where we determine
        // whether that URL gets served from the API or CDN.
        var host = settings.api_url;
        if (settings.api_cdn_whitelist && utils.baseurl(path) in settings.api_cdn_whitelist) {
            host = settings.cdn_url;
        }
        return host;
    }

    function media(path) {
        var media_url = settings.media_url;
        // Media URL should end with trailing slash.
        if (media_url.substr(-1) !== '/') {
            media_url += '/';
        }
        // Path should not start with leading slash.
        if (path[0] === '/') {
            path = path.substr(1);
        }
        return media_url + path;
    }

    return {
        reverse: reverse,
        api: {
            url: _userArgs(api),
            host: apiHost,
            params: _userArgs(apiParams),
            sign: _userArgs(function(url) {return url;}),
            unsign: _anonymousArgs(function(url) {return url;}),
            unsigned: {
                url: _anonymousArgs(api),
                params: _anonymousArgs(apiParams)
            },
            base: {
                url: api,
                host: apiHost,
                params: apiParams
            }
        },
        media: media
    };
});
