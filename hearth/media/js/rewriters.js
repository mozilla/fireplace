define('rewriters',
    ['log', 'underscore', 'urls', 'utils'],
    function(log, _, urls, utils) {

    var console = log('rewriters');

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
            delete new_qs._bust;
            var old_url = utils.urlparams(new_base, new_qs);
            console.log('Attempting to rewrite', old_url);
            if (!(old_url in c)) {
                console.error('Could not find cache entry to rewrite');
                return;
            }

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
        pagination(urls.api.unsigned.url('category')),

        // My Apps pagination rewriter
        pagination(urls.api.unsigned.url('installed'))
    ];
});
