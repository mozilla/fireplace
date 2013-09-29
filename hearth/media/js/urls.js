define('urls',
    ['buckets', 'capabilities', 'format', 'routes_api', 'settings', 'underscore', 'user', 'utils'],
    function(buckets, caps, format, api_endpoints, settings, _, user) {

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
            var i = 0;
            while (group_pattern.test(url)) {
                url = url.replace(group_pattern, '{' + i++ + '}');
            }

            // Check that we got the right number of arguments.
            if (args.length !== i) {
                console.error('Expected ' + i + ' args, got ' + args.length);
                throw new Error('Wrong number of arguments passed to reverse(). View: "' + view_name + '", Argument "' + args + '"');
            }

            return format.format(url, args);

        }
        console.error('Could not find the view "' + view_name + '".');
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
                true_region: user.get_setting('true_region') || '',
                true_carrier: user.get_setting('true_carrier') || '',
                dev: _dev(),
                device: _device(),
                pro: buckets.get_profile()
            };
            if (user.logged_in()) {
                args._user = user.get_token();
            }
            Object.keys(args).forEach(function(k) {
                if (!args[k] ||
                    settings.api_param_blacklist &&
                    settings.api_param_blacklist.indexOf(k) !== -1) {
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

    var media = function(path) {
        var media_url = document.body.getAttribute('data-media') || settings.media_url;
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
            sign: _userArgs(_.identity),
            unsigned: {
                url: api,
                params: apiParams
            }
        },
        media: media,
        _device: _device
    };
});
