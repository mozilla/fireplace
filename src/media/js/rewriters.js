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

    return [
        // My Apps pagination rewriter.
        pagination(urls.api.base.url('installed')),

        // Recommended pagination rewriter.
        pagination(urls.api.base.url('recommended')),

        // Search pagination rewriter.
        pagination(urls.api.base.url('search')),

        // Langpacks rewriter.
        pagination(urls.api.base.url('langpacks')),
    ];
});
