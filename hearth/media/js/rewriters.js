define(['underscore', 'urls', 'utils'], function(_, urls, utils) {

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
            delete new_qs.limit;
            var old_url = utils.urlparams(new_base, new_qs);
            console.log('[rewrite] Attempting to rewrite', old_url);
            if (!(old_url in c)) {
                console.error('[rewrite] Could not find cache entry to rewrite');
                return;
            }

            c[old_url].meta.total_count += new_value.meta.total_count;
            c[old_url].meta.limit += new_value.meta.limit;
            c[old_url].meta.next = new_value.meta.next;
            c[old_url].objects = c[old_url].objects.concat(new_value.objects);

            // Tell cache.js that we don't want to store the new cache item.
            return null;
        };
    }

    return [
        // Search pagination rewriter
        pagination(urls.api.unsigned.url('search')),

        // Category pagination rewriter
        pagination(urls.api.unsigned.url('category'))
    ];
});
