var routes = [
    {pattern: '^/$', view_name: 'homepage'},
    {pattern: '^/index.html$', view_name: 'homepage'},
    {pattern: '^/app/([^/<>"\']+)/ratings$', view_name: 'app/ratings'},
    {pattern: '^/app/([^/<>"\']+)/abuse$', view_name: 'app/abuse'},
    {pattern: '^/app/([^/<>"\']+)/privacy$', view_name: 'app/privacy'},
    {pattern: '^/app/([^/<>"\']+)$', view_name: 'app'},
    {pattern: '^/user/([^/<>"\']+)/abuse', view_name: 'user/abuse'},
    {pattern: '^/search$', view_name: 'search'},
    {pattern: '^/settings$', view_name: 'settings'},
    {pattern: '^/purchases$', view_name: 'purchases'},
    {pattern: '^/abuse$', view_name: 'abuse'},

    {pattern: '^/privacy-policy$', view_name: 'privacy'},
    {pattern: '^/terms-of-use$', view_name: 'terms'},

    {pattern: '^/tests$', view_name: 'tests'}
];

define(
    'routes',
    routes.map(function(i) {return 'views/' + i.view_name;}),
    function() {
        console.log('View Completion Report:');
        var view_dict = {};
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var view = require('views/' + route.view_name);
            console.log(!!view ? '√' : 'X', route.view_name);
            route.view = view;
        }
        window.v = view_dict;
        return routes;
    }
);
