define('urls',
    ['capabilities', 'format', 'settings', 'underscore', 'user', 'utils'],
    function(caps, format, settings, _) {

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
                console.error('Wrong number of arguments passed to reverse()', view_name, args);
                console.log('Expected ' + i + ' args, got ' + args.length);
                return null;
            }

            return format.format(url, args);

        }
        console.error('Could not find the view "' + view_name + '".')
    };

    var api_endpoints = {
        'homepage': '/homepage',
        'app': '/app/{0}',
        'ratings': '/app/{0}/ratings',
        'reviews': '/app/{0}/reviews',
        'app_abuse': '/app/{0}/abuse',
        'privacy': '/app/{0}/privacy',
        'settings': '/user/settings',
        'purchases': '/user/purchases',
        'login': '/user/login',
        'user_abuse': '/user/{0}/abuse',
        'search': '/search',
        'feedback': '/feedback',
        'terms_of_use': '/terms-of-use',
        'privacy_policy': '/privacy-policy'
    };

    var _device = _.once(function() {
        if (caps.firefoxOS) {
            return 'fxos';
        } else if (caps.firefoxAndroid) {
            return 'android';
        } else {
            return 'desktop';
        }
    });

    var user = require('user');
    function _userArgs(func) {
        return function() {
            var out = func.apply(this, arguments);
            var args = {
                lang: navigator.language,
                region: user.get_setting('region'),
                scr: caps.widescreen ? 'wide' : 'mobile',
                tch: caps.touch,
                dev: _device()
            };
            if (user.logged_in()) {
                args.user = user.get_token();
                args.email = user.get_setting('email');
            }
            return require('utils').urlparams(out, args);
        };
    }

    var api = _.memoize(_userArgs(function(endpoint, args) {
        if (!(endpoint in api_endpoints)) {
            console.error('Invalid API endpoint: ' + endpoint);
            return '';
        }
        return settings.api_url + format.format(api_endpoints[endpoint], args || []);
    }));

    var apiParams = _userArgs(function(endpoint, params) {
        return require('utils').urlparams(api(endpoint), params);
    });

    return {
        reverse: reverse,
        api: {
            url: api,
            params: apiParams
        }
    };
});
