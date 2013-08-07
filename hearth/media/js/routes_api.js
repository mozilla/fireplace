define('routes_api', [], function() {
    return {
        'app': '/api/v1/fireplace/app/{0}/',
        'app/privacy': '/api/v1/apps/app/{0}/privacy/',
        'category': '/api/v1/fireplace/search/featured/?cat={0}',
        'categories': '/api/v1/apps/category/',
        // TODO: Replace with real API when ready.
        'collection': '/api/v1/rocketfuel/collections/{0}/',
        'reviews': '/api/v1/apps/rating/',
        'review': '/api/v1/apps/rating/{0}/',
        'settings': '/api/v1/account/settings/mine/',
        'installed': '/api/v1/account/installed/mine/',
        'login': '/api/v1/account/login/',
        'newsletter': '/api/v1/account/newsletter/',
        'record_free': '/api/v1/installs/record/',
        'record_paid': '/api/v1/receipts/install/',
        'app_abuse': '/api/v1/abuse/app/',
        'search': '/api/v1/apps/search/',
        'feedback': '/api/v1/account/feedback/',

        'prepare_nav_pay': '/api/v1/webpay/prepare/',
        'payments_status': '/api/v1/webpay/status/{0}/'
    };
});
