/*
    Cache rewriters. Mostly used to rewrite the first page of paginated
    endpoints such that when the user revisits the page, other pages are
    automatically loaded.
*/
define('rewriters',
    ['core/log', 'core/settings', 'underscore', 'core/urls', 'core/utils', 'routes'],
    function(log, settings, _, urls, utils, routes) {
    var logger = log('rewriters');

    function pagination(url) {
        return function(new_key, new_value, c) {
            var new_base = utils.baseurl(new_key);
            if (new_base !== utils.baseurl(url)) {
                return;
            }
            // Don't rewrite if we're only getting the first page.
            var new_qs = utils.querystring(new_key);
            if (!('offset' in new_qs)) {
                return;
            }

            delete new_qs.offset;
            delete new_qs._bust;
            var old_url = utils.urlparams(new_base, new_qs);
            logger.log('Attempting to rewrite', old_url);
            if (!(old_url in c)) {
                logger.error('Could not find cache entry to rewrite');
                return;
            }

            c[old_url].meta.limit += new_value.meta.limit;
            c[old_url].meta.next = new_value.meta.next;
            c[old_url].objects = c[old_url].objects.concat(new_value.objects);

            // Tell cache.js that we don't want to store the new cache item.
            return null;
        };
    }

    if (!settings.cache_rewriting_enabled) {
        return [];
    }

    var rewriteEndpoints = [
        'feed',
        'installed',
        'recommended',
        'reviews',
        'search',
        'langpacks'
    ];

    return rewriteEndpoints.map(function(endpoint) {
        return pagination(urls.api.base.url(endpoint));
    });
});
