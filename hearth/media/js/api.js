define(['underscore'], function(_) {
    var api_endpoints = {
        'homepage': '/homepage',
        'app': '/app/{0}',
        'ratings': '/app/{0}/ratings',
        'abuse': '/app/{0}/report',
        'settings': '/user/settings',
        'feedback': '/feedback',
    };

    var api = _.memoize(function(endpoint, args) {
        return settings.api_url + format(api_endpoints[endpoint], args || []);
    });

    return api;
})