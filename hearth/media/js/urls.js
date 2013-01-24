define('urls', ['views'], function(views) {

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

    var group_pattern = /\(.+\)/;
    var reverse = function(view_name, args) {
        args = args || [];
        for (var i in views.routes) {
            var route = views.routes[i];
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

            return format(url, args);

        }
        console.error('Could not find the view "' + view_name + '".')
    };

    return {
        api: api,
        reverse: reverse
    };
});

var urls = require('urls');
var api = urls.api;
var reverse = urls.reverse;
