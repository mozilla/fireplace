define('cache', ['rewriters', 'underscore'], function(rewriters, _) {

    var cache = {};

    function has(key) {
        return key in cache;
    }

    function get(key) {
        return cache[key];

    }

    function purge() {
        for (var key in cache) {
            if (cache.hasOwnProperty(key)) {
                delete cache[key];
            }
        }
    }

    function set(key, value) {
        for (var i = 0, rw; rw = rewriters[i++];) {
            var output = rw(key, value, cache);
            if (output === null) {
                return;
            } else if (output) {
                value = output;
            }
        }
        cache[key] = value;
    }

    function bust(key) {
        if (key in cache) {
            delete cache[key];
        }
    }

    function rewrite(matcher, worker, limit) {
        var count = 0;
        for (var key in cache) {
            if (matcher(key)) {
                cache[key] = worker(cache[key], key);
                if (limit && ++count >= limit) {
                    return;
                }
            }
        }
    }

    return {
        has: has,
        get: get,
        set: set,
        bust: bust,
        purge: purge,

        attemptRewrite: rewrite,
        raw: cache
    };
});
