define('routes', [], function() {
    return [
        {pattern: '^/$', view_name: 'homepage'},
        {pattern: '^/app/([^/<>"\']+)/ratings$', view_name: 'app/ratings'},
        {pattern: '^/app/([^/<>"\']+)/abuse$', view_name: 'app/abuse'},
        {pattern: '^/app/([^/<>"\']+)/privacy$', view_name: 'app/privacy'},
        {pattern: '^/app/([^/<>"\']+)$', view_name: 'app'},
        {pattern: '^/search$', view_name: 'search'},
        {pattern: '^/settings$', view_name: 'settings'},
        {pattern: '^/purchases$', view_name: 'purchases'},
        {pattern: '^/feedback$', view_name: 'feedback'},

        {pattern: '^/privacy$', view_name: 'privacy'},
        {pattern: '^/terms$', view_name: 'terms'}
    ]
});
