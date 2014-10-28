define('routes_api', [], function() {
    return {
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
        'feed-app': '/api/v2/fireplace/feed/apps/{0}/',
        'feed-brand': '/api/v2/fireplace/feed/brands/{0}/',
        'feed-collection': '/api/v2/fireplace/feed/collections/{0}/',
        'feed-items': '/api/v2/feed/items/',
        'feed-shelf': '/api/v2/fireplace/feed/shelves/{0}/',
        'feedback': '/api/v2/account/feedback/',
        'fxa-login': '/api/v2/account/fxa-login/',
        'installed': '/api/v2/account/installed/mine/',
        'login': '/api/v2/account/login/',
        'logout': '/api/v2/account/logout/',
        // New / Popular pages use a regular search API call, but we need
        // device filtering depending on the page group, so we need an alias.
        'new_popular_search': '/api/v2/fireplace/search/?cache=1&vary=0',
        'newsletter': '/api/v2/account/newsletter/',
        'payments_status': '/api/v2/webpay/status/{0}/',
        'prepare_nav_pay': '/api/v2/webpay/prepare/',
        'preverify_token': '/api/v2/account/fxa-preverify/',
        'preverify_confirmation': '/api/v2/account/fxa-preverify/confirm/{0}/',
        'recommended': '/api/v2/apps/recommend/',
        'record_free': '/api/v2/installs/record/',
        'record_paid': '/api/v2/receipts/install/',
        'review': '/api/v2/apps/rating/{0}/',
        'reviews': '/api/v2/apps/rating/',
        'search': '/api/v2/fireplace/search/?cache=1&vary=0',
        'settings': '/api/v2/account/settings/mine/',
        'site-config': '/api/v2/services/config/site/?cache=1&serializer=commonplace&vary=0',
    };
});
