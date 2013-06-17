define('urls',
    ['buckets', 'capabilities', 'format', 'settings', 'underscore', 'user', 'utils'],
    function(buckets, caps, format, settings, _, user) {

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
                console.error('Expected ' + i + ' args, got ' + args.length);
                throw new Error('Wrong number of arguments passed to reverse(). View: "' + view_name + '", Argument "' + args + '"');
            }

            return format.format(url, args);

        }
        console.error('Could not find the view "' + view_name + '".');
    };

    var api_endpoints = {
        'app': '/api/v1/apps/app/{0}/',
        'app/privacy': '/api/v1/apps/app/{0}/privacy/',
        'category': '/api/v1/apps/search/featured/?cat={0}',
        'categories': '/api/v1/apps/category/',
        'reviews': '/api/v1/apps/rating/',
        'review': '/api/v1/apps/rating/{0}/',
        'settings': '/api/v1/account/settings/mine/',
        'installed': '/api/v1/account/installed/mine/',
        'login': '/api/v1/account/login/',
        'newsletter': '/api/v1/account/newsletter/',
        'record': '/api/v1/receipts/install/',
        'app_abuse': '/api/v1/abuse/app/',
        'search': '/api/v1/apps/search/',
        'feedback': '/api/v1/account/feedback/',

        'prepare_nav_pay': '/api/v1/webpay/prepare/',
        'payments_status': '/api/v1/webpay/status/{0}/'
    };

    function _dev() {
        if (caps.firefoxOS) {
            return 'firefoxos';
        } else if (caps.firefoxAndroid) {
            return 'android';
        }
    }

    function _device() {
        // TODO: Deprecate this. (This was a quick fix for bug 875495 until buchets land.)
        if (caps.firefoxOS) {
            return 'firefoxos';
        } else if (caps.firefoxAndroid) {
            if (caps.widescreen()) {
                return 'tablet';
            }
            return 'mobile';
        }
    }

    function _userArgs(func) {
        return function() {
            var out = func.apply(this, arguments);
            var lang = navigator.language;
            if (navigator.l10n && navigator.l10n.language) {
                lang = navigator.l10n.language;
            }
            var args = {
                lang: lang,
                region: user.get_setting('region') || '',
                carrier: user.get_setting('carrier') || '',
                //scr: caps.widescreen() ? 'wide' : 'mobile',
                //tch: caps.touch,
                dev: _dev(),
                device: _device(),
                pro: buckets.get_profile()
            };
            if (user.logged_in()) {
                args._user = user.get_token();
            }
            Object.keys(args).forEach(function(k) {
                if (!args[k]) {
                    delete args[k];
                }
            });
            return require('utils').urlparams(out, args);
        };
    }

    var api = function(endpoint, args, params) {
        if (!(endpoint in api_endpoints)) {
            console.error('Invalid API endpoint: ' + endpoint);
            return '';
        }
        var url = settings.api_url + format.format(api_endpoints[endpoint], args || []);
        if (params) {
            return require('utils').urlparams(url, params);
        }
        return url;
    };

    var apiParams = function(endpoint, params) {
        return api(endpoint, [], params);
    };

    return {
        reverse: reverse,
        api: {
            url: _userArgs(api),
            params: _userArgs(apiParams),
            sign: _userArgs(_.identity),
            unsigned: {
                url: api,
                params: apiParams
            }
        },
        _device: _device
    };
});
