define('routes_api', [], function() {
    return {
        'app': '/api/v2/fireplace/app/{0}/?cache=1&vary=0',
        'app/privacy': '/api/v2/apps/app/{0}/privacy/?cache=1&vary=0',
        'category': '/api/v2/fireplace/search/featured/?cat={0}&cache=1&vary=0',
        'categories': '/api/v2/apps/category/?cache=1&vary=0',
        'collection': '/api/v2/fireplace/collection/{0}/?cache=1&vary=0',
        'reviews': '/api/v2/apps/rating/',
        'review': '/api/v2/apps/rating/{0}/',
        'settings': '/api/v2/account/settings/mine/',
        'installed': '/api/v2/account/installed/mine/',
        'login': '/api/v2/account/login/',
        'logout': '/api/v2/account/logout/',
        'newsletter': '/api/v2/account/newsletter/',
        'record_free': '/api/v2/installs/record/',
        'record_paid': '/api/v2/receipts/install/',
        'app_abuse': '/api/v2/abuse/app/',
        'search': '/api/v2/fireplace/search/?cache=1&vary=0',
        'feedback': '/api/v2/account/feedback/',
        'consumer_info': '/api/v2/fireplace/consumer-info/',
        'features': '/api/v2/apps/features/',
        'feed-items': '/api/v2/feed/items/',

        'prepare_nav_pay': '/api/v2/webpay/prepare/',
        'payments_status': '/api/v2/webpay/status/{0}/'
    };
});
