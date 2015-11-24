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

    // List of URLs to rewrite.
    var rewriteURLs = [
        urls.api.base.url('addon_list'),
        // Do not include category endpoints: they are already covered, because
        // we are rewriting search a few lines below, which is using the same
        // base URL.
        urls.api.base.url('feed'),
        urls.api.base.url('installed'),
        urls.api.base.url('langpacks'),
        urls.api.base.url('late-customization'),
        urls.api.base.url('recommended'),
        urls.api.base.url('reviews'),
        urls.api.base.url('search'),
    ];

    // Return the list of rewriter functions. Caching code will call them all
    // every time it writes something in the cache, so we filter them to make
    // sure there are no duplicates.
    return _.uniq(rewriteURLs).map(function(url) {
        return pagination(url);
    });
});
