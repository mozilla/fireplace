define(['underscore', 'utils'], function(_, utils) {
    var api_endpoints = {
        'homepage': '/homepage',
        'app': '/app/{0}',
        'ratings': '/app/{0}/ratings',
        'abuse': '/app/{0}/report',
        'settings': '/user/settings',
        'search': '/search',
        'feedback': '/feedback',
    };

    var api = _.memoize(function(endpoint, args) {
        return settings.api_url + format(api_endpoints[endpoint], args || []);
    });

    var apiParams = function(endpoint, params) {
        return utils.urlparams(api(endpoint), params);
    };

    return {
        url: api,
        params: apiParams
    };
})