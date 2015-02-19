(function() {

// Please leave quotes around keys! They're needed for Space Heater.
var routes = window.routes = [
    {'pattern': '^/(app.html|index.html)?$', 'view_name': 'homepage'},
    {'pattern': '^/app/([^/<>"\']+)/?$', 'view_name': 'app'},
    {'pattern': '^/app/([^/<>"\']+)/abuse$', 'view_name': 'app/abuse'},
    {'pattern': '^/app/([^/<>"\']+)/privacy$', 'view_name': 'app/privacy'},
    {'pattern': '^/app/([^/<>"\']+)/ratings$', 'view_name': 'app/ratings'},
    {'pattern': '^/app/([^/<>"\']+)/ratings/add$', 'view_name': 'app/ratings/add'},
    {'pattern': '^/app/([^/<>"\']+)/ratings/edit$', 'view_name': 'app/ratings/edit'},
    {'pattern': '^/app/([^/<>"\']+)/ratings/([^/<>"\']+)$', 'view_name': 'app/ratings/rating'},
    {'pattern': '^/app/([^/<>"\']+)/receipt$', 'view_name': 'app/receipt'},
    {'pattern': '^/categories$', 'view_name': 'categories'},
    {'pattern': '^/category/([^/<>"\']+)$', 'view_name': 'category'},
    {'pattern': '^/credits$', 'view_name': 'credits'},
    {'pattern': '^/debug$', 'view_name': 'debug'},
    {'pattern': '^/debug/features$', 'view_name': 'debug_features'},
    {'pattern': '^/feed/app/([^/<>"\']+)/?$', 'view_name': 'feed/app'},
    {'pattern': '^/feed/collection/([^/<>"\']+)/?$', 'view_name': 'feed/collection'},
    {'pattern': '^/feed/editorial/([^/<>"\']+)/?$', 'view_name': 'feed/editorial'},
    {'pattern': '^/feed/shelf/([^/<>"\']+)/?$', 'view_name': 'feed/shelf'},
    {'pattern': '^/feedback$', 'view_name': 'feedback'},
    {'pattern': '^/fxa-authorize$', 'view_name': 'fxa_authorize'},
    {'pattern': '^/langpacks/([^/<>"\']+)$', 'view_name': 'langpacks'},
    {'pattern': '^/new$', 'view_name': 'new'},
    {'pattern': '^/newsletter-signup$', 'view_name': 'newsletter_signup'},
    {'pattern': '^/popular$', 'view_name': 'popular'},
    {'pattern': '^/privacy-policy$', 'view_name': 'privacy'},
    {'pattern': '^/purchases$', 'view_name': 'purchases'},
    {'pattern': '^/recommended$', 'view_name': 'recommended'},
    {'pattern': '^/search/?$', 'view_name': 'search'},
    {'pattern': '^/settings$', 'view_name': 'settings'},
    {'pattern': '^/terms-of-use$', 'view_name': 'terms'},
    {'pattern': '^/tests$', 'view_name': 'tests'},
    {'pattern': '^/usage$', 'view_name': 'usage'}
];

define('routes', [
    'views/homepage',
    'views/app',
    'views/app/abuse',
    'views/app/privacy',
    'views/app/ratings',
    'views/app/ratings/rating',
    'views/app/ratings/add',
    'views/app/ratings/edit',
    'views/app/receipt',
    'views/categories',
    'views/category',
    'views/credits',
    'views/debug',
    'views/debug_features',
    'views/feed/app',
    'views/feed/collection',
    'views/feed/editorial',
    'views/feed/shelf',
    'views/feedback',
    'views/fxa_authorize',
    'views/langpacks',
    'views/new',
    'views/newsletter_signup',
    'views/popular',
    'views/privacy',
    'views/purchases',
    'views/recommended',
    'views/search',
    'views/settings',
    'views/terms',
    'views/tests',
    'views/usage'
], function() {
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        var view = require('views/' + route.view_name);
        route.view = view;
    }
    return routes;
});

})();
