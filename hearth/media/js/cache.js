define('cache', ['log', 'rewriters'], function(log, rewriters) {

    var console = log('cache');

    var cache = {};

    function has(key) {
        return key in cache;
    }

    function get(key) {
        return cache[key];
    }

    function purge(filter) {
        for (var key in cache) {
            if (cache.hasOwnProperty(key)) {
                if (filter && !filter(key)) {
                    continue;
                }
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
        console.log('Busting cache for ', key);
        if (key in cache) {
            delete cache[key];
        }
    }

    function rewrite(matcher, worker, limit) {
        var count = 0;
        console.log('Attempting cache rewrite');
        for (var key in cache) {
            if (matcher(key)) {
                console.log('Matched cache rewrite pattern for key ', key);
                cache[key] = worker(cache[key], key);
                if (limit && ++count >= limit) {
                    console.log('Cache rewrite limit hit, exiting');
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
