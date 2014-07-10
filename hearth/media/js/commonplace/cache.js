define('cache',
    ['log', 'rewriters', 'settings', 'storage', 'user', 'utils', 'z'],
    function(log, rewriters, settings, storage, user, utils, z) {

    var console = log('cache');

    var cache = {};
    var cache_key = 'request_cache';

    if (settings.offline_cache_enabled && settings.offline_cache_enabled()) {
        cache = JSON.parse(storage.getItem(cache_key) || '{}');
        flush_expired();
    }

    // Persist the cache for whitelisted URLs.
    window.addEventListener('beforeunload', save, false);

    function get_ttl(url) {
        // Returns TTL for an API URL in microseconds.
        var path = utils.urlparse(url).pathname;
        if (settings.offline_cache_whitelist && path in settings.offline_cache_whitelist) {
            // Convert from seconds to microseconds.
            return settings.offline_cache_whitelist[path] * 1000;
        }
        return null;
    }

    function save() {
        if (settings.offline_cache_enabled && !settings.offline_cache_enabled()) {
            return;
        }

        var cache_to_save = {};
        Object.keys(cache).forEach(function (url) {
            // If there is a TTL assigned to this URL, then we can cache it.
            if (get_ttl(url) !== null) {
                cache_to_save[url] = cache[url];
            }
        });

        // Trigger an event to save the cache. (We do size checks to see if
        // the combined request+model cache is too large to persist.)
        z.doc.trigger('save_cache', cache_key);

        // Persist only if the data has changed.
        var cache_to_save_str = JSON.stringify(cache_to_save);
        if (storage.getItem(cache_key) !== cache_to_save_str) {
            storage.setItem(cache_key, cache_to_save_str);
            console.log('Persisting request cache');
        }
    }

    function flush() {
        cache = {};
    }

    function flush_signed() {
        // This gets called when a user logs out, so we remove any requests
        // with user data in them.

        // First, we remove every signed URL from the request cache.
        Object.keys(cache).forEach(function (url) {
            if (url.indexOf('_user=' + user.get_token()) !== -1) {
                console.log('Removing signed URL', url);
                delete cache[url];
            }
        });

        // Then, we persist the cache.
        save();
    }

    function flush_expired() {
        // This gets called once when the page loads to purge any expired
        // persisted responses.

        var now = +new Date();
        var time;
        var ttl = null;

        Object.keys(cache).forEach(function (url) {
            // Get the timestamp.
            time = cache[url].__time;

            // Get the TTL if this URL is allowed to be cached.
            ttl = get_ttl(url);

            // If the item is expired, remove it from the cache.
            if (!time || time + ttl <= now) {
                console.log('Removing expired URL', url);
                return delete cache[url];
            }
        });

        save();
    }

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

    var persistentCachePrefix = 'cache.persist::';
    var persistent = {
        // This uses localStorage for persistent storage of cache entries.
        get: function(key) {
            if (has(key)) {
                return get(key);
            } else {
                var val = storage.getItem(persistentCachePrefix + key);
                set(key, val);
                return val;
            }
        },
        set: function(key, val) {
            storage.setItem(persistentCachePrefix + key, val);
            set(key, val);
        },
        bust: function(key) {
            storage.removeItem(persistentCachePrefix + key);
            bust(key);
        },
        has: function(key) {
            return storage.getItem(persistentCachePrefix + key);
        },
        purge: function() {
            for (var i = 0; i < storage.length; i++) {
                var key = storage.key(i);
                if (key.indexOf(persistentCachePrefix) === 0) {
                    storage.removeItem(persistentCachePrefix + key);
                    bust(key.replace(persistentCachePrefix, ''));
                }
            }
        }
    };

    function rewrite(matcher, worker, limit) {
        var count = 0;
        console.log('Attempting cache rewrite');
        for (var key in cache) {
            if (matcher(key)) {
                console.log('Matched cache rewrite pattern for key ', key);
                var rewrittenValue = worker(cache[key], key);
                cache[key] = rewrittenValue;

                // Update persistent cache if the key exists there.
                if (persistent.has(key)) {
                    persistent.set(key, rewrittenValue);
                }
                if (limit && ++count >= limit) {
                    console.log('Cache rewrite limit hit, exiting');
                    return;
                }
            }
        }
    }

    return {
        attemptRewrite: rewrite,
        bust: bust,
        cache: cache,
        flush: flush,
        flush_expired: flush_expired,
        flush_signed: flush_signed,
        get: get,
        get_ttl: get_ttl,
        has: has,
        persist: persistent,
        purge: purge,
        raw: cache,
        set: set
    };
});
