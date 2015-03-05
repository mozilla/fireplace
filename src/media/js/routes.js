define('routes', [
    'compatibility_filtering',
    'core/router',
    'user_helpers',
    'core/utils',
], function(compatibility_filtering, router, user_helpers, utils) {
    router.addRoutes([
        {'pattern': '^/(app.html|index.html)?$', 'view_name': 'homepage'},
        {'pattern': '^/app/([^/<>"\']+)/?$', 'view_name': 'app'},
        {'pattern': '^/app/([^/<>"\']+)/abuse$', 'view_name': 'app/abuse'},
        {'pattern': '^/app/([^/<>"\']+)/privacy$', 'view_name': 'app/privacy'},
        {'pattern': '^/app/([^/<>"\']+)/ratings$', 'view_name': 'app/ratings'},
        {'pattern': '^/app/([^/<>"\']+)/ratings/add$',
         'view_name': 'app/ratings/add'},
        {'pattern': '^/app/([^/<>"\']+)/ratings/edit$',
         'view_name': 'app/ratings/edit'},
        {'pattern': '^/app/([^/<>"\']+)/ratings/([^/<>"\']+)$',
         'view_name': 'app/ratings/rating'},
        {'pattern': '^/app/([^/<>"\']+)/receipt$', 'view_name': 'app/receipt'},
        {'pattern': '^/categories$', 'view_name': 'categories'},
        {'pattern': '^/category/([^/<>"\']+)$', 'view_name': 'category'},
        {'pattern': '^/credits$', 'view_name': 'credits'},
        {'pattern': '^/debug$', 'view_name': 'debug'},
        {'pattern': '^/debug/features$', 'view_name': 'debug_features'},
        {'pattern': '^/feed/(collection|editorial|shelf)/([^/<>"\']+)/?$',
         'view_name': 'feed_landing'},
        {'pattern': '^/feedback$', 'view_name': 'feedback'},
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
        {'pattern': '^/usage$', 'view_name': 'usage'},
    ]);

    router.api.addRoutes({
        'account_info': '/api/v2/account/info/{0}',
        'app': '/api/v2/fireplace/app/{0}/?cache=1&vary=0',
        'app/privacy': '/api/v2/apps/app/{0}/privacy/?cache=1&vary=0',
        'app_abuse': '/api/v2/abuse/app/',
        'category_landing': '/api/v2/fireplace/search/?cat={0}&cache=1&vary=0',
        // consumer_info should be cached by the browser, never served by the
        // CDN, we can keep the Vary header.
        'consumer_info': '/api/v2/fireplace/consumer-info/?cache=1',
        'features': '/api/v2/apps/features/',
        'feed': '/api/v2/feed/get/?cache=21600&vary=0',
        'feed-app': '/api/v2/fireplace/feed/apps/{0}/?cache=1&vary=0',
        'feed-brand': '/api/v2/fireplace/feed/brands/{0}/?cache=1&vary=0',
        'feed-collection': '/api/v2/fireplace/feed/collections/{0}/?cache=1&vary=0',
        'feed-shelf': '/api/v2/fireplace/feed/shelves/{0}/?cache=1&vary=0',
        'feedback': '/api/v2/account/feedback/',
        'installed': '/api/v2/account/installed/mine/',
        'langpacks': '/api/v2/langpacks/?cache=1&vary=0',
        'login': '/api/v2/account/login/',
        'logout': '/api/v2/account/logout/',
        // New / Popular pages use a regular search API call, but we need
        // device filtering depending on the page group, so we need an alias.
        'new_popular_search': '/api/v2/fireplace/search/?cache=1&vary=0',
        'newsletter': '/api/v2/account/newsletter/',
        'payments_status': '/api/v2/webpay/status/{0}/',
        'prepare_nav_pay': '/api/v2/webpay/prepare/',
        'recommended': '/api/v2/apps/recommend/?cache=1',
        'record_free': '/api/v2/installs/record/',
        'record_paid': '/api/v2/receipts/install/',
        'review': '/api/v2/apps/rating/{0}/',
        'reviews': '/api/v2/apps/rating/',
        'search': '/api/v2/fireplace/search/?cache=1&vary=0',
        'settings': '/api/v2/account/settings/mine/',
        'site-config': '/api/v2/services/config/site/?cache=1&serializer=commonplace&vary=0',
    });

    router.api.addProcessor(function(endpoint) {
        // Ask compatibility_filtering module for the base args to use, then
        // add a few extra generic ones.
        var args = compatibility_filtering.api_args(endpoint);
        args.region = user_helpers.region(undefined, true);
        args.carrier = user_helpers.carrier();
        return args;
    });
});
