define(
    ['capabilities', 'format', 'routes', 'settings', 'underscore', 'utils'],
    function(caps, format, routes, settings, _, utils) {

    var group_pattern = /\(.+\)/;
    var reverse = function(view_name, args) {
        args = args || [];
        for (var i in routes) {
            var route = routes[i];
            if (route.view_name != view_name)
                continue;

            // Strip the ^ and $ from the route pattern.
            var url = route.pattern.substring(1, route.pattern.length - 1);

            // TODO: if we get significantly complex routes, it might make
            // sense to _.memoize() or somehow cache the pre-formatted URLs.

            // Replace each matched group with a positional formatting placeholder.
            var i = 0;
            while (group_pattern.test(url)) {
                url = url.replace(group_pattern, '{' + i++ + '}');
            }

            // Check that we got the right number of arguments.
            if (args.length != i) {
                console.error('Wrong number of arguments passed to reverse()');
                console.log('Expected ' + i + ' args, got ' + args.length);
                return null;
            }

            return format.format(url, args);

        }
        console.error('Could not find the view "' + view_name + '".')
    };


    // API functions

    var api_endpoints = {
        'homepage': '/homepage',
        'app': '/app/{0}',
        'ratings': '/app/{0}/ratings',
        'abuse': '/app/{0}/report',
        'settings': '/user/settings',
        'search': '/search',
        'feedback': '/feedback',
    };

    var urlparams = utils.urlparams;

    function _device() {
        if (caps.firefoxOS) {
            return 'fxos';
        } else if (caps.firefoxAndroid) {
            return 'android';
        } else {
            return 'desktop';
        }
    }

    function _userArgs(func) {
        return function() {
            var out = func.apply(this, arguments);
            var args = {
                lang: navigator.language,
                reg: 'br',  // TODO(cvan): Put the actual region here once the user module is written.
                user: null,  // TODO(cvan): Put the user token here when we're doing that.
                scr: (caps.desktop || caps.tablet) ? 'wide' : 'mobile',
                dev: _device()
            };
            return urlparams(out, args);
        };
    }

    var api = _.memoize(_userArgs(function(endpoint, args) {
        if (!(endpoint in api_endpoints)) {
            throw new Error('Invalid API endpoint: ' + endpoint);
        }
        return settings.api_url + format.format(api_endpoints[endpoint], args || []);
    }));

    var apiParams = _userArgs(function(endpoint, params) {
        return urlparams(api(endpoint), params);
    });

    return {
        reverse: reverse,
        api: {
            url: api,
            params: apiParams
        }
    };
});
