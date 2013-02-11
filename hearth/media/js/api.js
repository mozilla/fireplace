define(['capabilities', 'format', 'settings', 'underscore', 'utils'], function(caps, format, settings, _, utils) {
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
        return settings.api_url + format.format(api_endpoints[endpoint], args || []);
    }));

    var apiParams = _userArgs(function(endpoint, params) {
        return urlparams(api(endpoint), params);
    });

    return {
        url: api,
        params: apiParams
    };
});
