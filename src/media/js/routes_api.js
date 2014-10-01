define('routes_api', [], function() {
    return {
        'app': '/api/v2/fireplace/app/{0}/?cache=1&vary=0',
        'app/privacy': '/api/v2/apps/app/{0}/privacy/?cache=1&vary=0',
        'category_landing': '/api/v2/fireplace/search/?cat={0}&cache=1&vary=0',
        'fxa-login': '/api/v2/account/fxa-login/',
        'reviews': '/api/v2/apps/rating/',
        'review': '/api/v2/apps/rating/{0}/',
        'settings': '/api/v2/account/settings/mine/',
        'account_info': '/api/v2/account/info/{0}',
        'installed': '/api/v2/account/installed/mine/',
        'login': '/api/v2/account/login/',
        'logout': '/api/v2/account/logout/',
        'newsletter': '/api/v2/account/newsletter/',
        'record_free': '/api/v2/installs/record/',
        'record_paid': '/api/v2/receipts/install/',
        'app_abuse': '/api/v2/abuse/app/',
        'search': '/api/v2/fireplace/search/?cache=1&vary=0',
        'recommended': '/api/v2/apps/recommend/',
        'feedback': '/api/v2/account/feedback/',
        'consumer_info': '/api/v2/fireplace/consumer-info/',
        'features': '/api/v2/apps/features/',
        'preverify_token': '/api/v2/account/fxa-preverify/',

        'prepare_nav_pay': '/api/v2/webpay/prepare/',
        'payments_status': '/api/v2/webpay/status/{0}/',

        'feed-app': '/api/v2/fireplace/feed/apps/{0}/',
        'feed-brand': '/api/v2/fireplace/feed/brands/{0}/',
        'feed-collection': '/api/v2/fireplace/feed/collections/{0}/',
        'feed-shelf': '/api/v2/fireplace/feed/shelves/{0}/',
        'feed-items': '/api/v2/feed/items/',
        'feed': '/api/v2/feed/get/?cache=1&vary=0',

        // New / Popular pages use a regular search API call, but we need to
        // do device filtering differently depending on the page group, so we
        // need an alias.
        'new_popular_search': '/api/v2/fireplace/search/?cache=1&vary=0'
    };
});
