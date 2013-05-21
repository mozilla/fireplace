(function() {

var dependencies;
/* dtrace */
var routes = [
    {pattern: '^/$', view_name: 'homepage'},
    {pattern: '^/(index|server).html$', view_name: 'homepage'},
    {pattern: '^/app/([^/<>"\']+)/ratings/add$', view_name: 'app/ratings/add'},
    {pattern: '^/app/([^/<>"\']+)/ratings/edit$', view_name: 'app/ratings/edit'},
    {pattern: '^/app/([^/<>"\']+)/ratings$', view_name: 'app/ratings'},
    {pattern: '^/app/([^/<>"\']+)/abuse$', view_name: 'app/abuse'},
    {pattern: '^/app/([^/<>"\']+)/privacy$', view_name: 'app/privacy'},
    {pattern: '^/app/([^/<>"\']+)$', view_name: 'app'},
    {pattern: '^/app/([^/<>"\']+)/$', view_name: 'app'},  // For the trailing slash
    {pattern: '^/search$', view_name: 'search'},
    {pattern: '^/category/([^/<>"\']+)$', view_name: 'category'},
    {pattern: '^/category/([^/<>"\']+)/featured$', view_name: 'featured'},
    {pattern: '^/settings$', view_name: 'settings'},
    {pattern: '^/feedback$', view_name: 'feedback'},
    {pattern: '^/purchases$', view_name: 'purchases'},

    {pattern: '^/privacy-policy$', view_name: 'privacy'},
    {pattern: '^/terms-of-use$', view_name: 'terms'},

    {pattern: '^/tests$', view_name: 'tests'},
    {pattern: '^/debug$', view_name: 'debug'}
];

dependencies = routes.map(function(i) {return 'views/' + i.view_name;});
/* /dtrace */
window.routes = routes;

define(
    'routes',
    // Dynamically import all the view modules from the routes
    dependencies,
    function() {
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var view = require('views/' + route.view_name);
            route.view = view;
        }
        return routes;
    }
);

})();
