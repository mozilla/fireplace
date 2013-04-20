define(['underscore'], function(_) {

    cache = {};

    function has(key) {
        return key in cache;
    }

    function get(key) {
        return cache[key];
    }

    function set(key, value) {
        cache[key] = value;
    }

    function bust(key) {
        delete cache[key];
    }

    function rewrite(matcher, worker, limit) {
        var count = 0;
        for (var key in cache) {
            if (matcher(key)) {
                cache[key] = worker(cache[key]);
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

        attemptRewrite: rewrite,
        raw: cache
    };
});
