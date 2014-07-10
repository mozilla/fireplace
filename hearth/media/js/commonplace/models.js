define('models',
    ['cache', 'defer', 'log', 'requests', 'settings', 'storage', 'underscore', 'z'],
    function(cache, defer, log, requests, settings, storage, _, z) {

    var console = log('model');

    // {'type': {'<id>': object}}
    var cache_key = 'model_cache';
    var data_store = {};

    if (settings.offline_cache_enabled && settings.offline_cache_enabled()) {
        data_store = JSON.parse(storage.getItem(cache_key) || '{}');
    }

    // Persist the model cache.
    window.addEventListener('beforeunload', save, false);

    z.doc.on('saving_offline_cache', function (e, cache_key) {
        // Really, this should be an LRU cache but the builder has an
        // expectation that a hit to the request cache means that the models
        // have been casted and exist already in the model cache too.
        //
        // It gets too complicated having one LRU cache for the request cache
        // and then independent LRU caches for app, category, and collection
        // model caches. It's fine. It's fine.

        var data = {
            'request_cache': JSON.stringify(cache.cache),
            'model_cache': JSON.stringify(data_store)
        };

        var size = (JSON.stringify(data.request_cache).length +
                    JSON.stringify(data.model_cache).length);
        if (size >= settings.offline_cache_limit) {
            console.warn('Quota exceeded for request/model offline cache; ' +
                         'flushing cache');
            cache.flush();
            flush();
            storage.setItem(cache_key, data_store_str);
        } else {
            // Persist only if the data has changed.
            var data_store_str = data[cache_key];
            if (storage.getItem(cache_key) !== data_store_str) {
                storage.setItem(cache_key, data_store_str);
                console.log('Persisting model cache');
            }
        }
    });

    function flush() {
        // Purge cache for every type of model.
        data_store = {};
    }

    function save() {
        z.doc.trigger('save_cache', cache_key);

        // Persist only if the data has changed.
        var data_store_str = JSON.stringify(data_store);
        if (storage.getItem(cache_key) !== data_store_str) {
            storage.setItem(cache_key, data_store_str);
            console.log('Persisting model cache');
        }
    }

    var prototypes = settings.model_prototypes;

    return function(type) {
        if (!(type in prototypes)) {
            throw new Error('Unknown model "' + type + '"');
        }

        if (!(type in data_store)) {
            // Where's defaultdict when you need it
            data_store[type] = {};
        }

        var key = prototypes[type];

        function cast(data, do_not_return) {
            function do_cast(data) {
                var keyed_value = data[key];
                data_store[type][keyed_value] = data;
                console.log('Stored ' + keyed_value + ' as ' + type);
            }
            if (_.isArray(data)) {
                _.each(data, do_cast);
                return do_not_return ? null : data;
            } else {
                var casted_data = do_cast(data);
                return do_not_return ? null : [casted_data, data];
            }
        }

        function uncast(object) {
            function do_uncast(object) {
                return data_store[type][object[key]];
            }
            if (_.isArray(object)) {
                return object.map(do_uncast);
            }
            return do_uncast(object);
        }

        function get(url, keyed_value, getter) {
            getter = getter || requests.get;

            if (keyed_value) {
                if (keyed_value in data_store[type]) {
                    // Call the `.done()` function back in `request()`.
                    console.log('Found ' + type + ' with key ' + keyed_value);
                    return defer.Deferred()
                                .resolve(data_store[type][keyed_value])
                                .promise({__cached: true});
                }

                console.log(type + ' cache miss for key ' + keyed_value);
            }

            return getter(url);
        }

        function lookup(keyed_value, by) {
            if (by) {
                for (var key in data_store[type]) {
                    var item = data_store[type][key];
                    if (by in item && item[by] === keyed_value) {
                        return item;
                    }
                }
                return;
            }
            if (keyed_value in data_store[type]) {
                console.log('Found ' + type + ' with lookup key ' + keyed_value);
                return data_store[type][keyed_value];
            }

            console.log(type + ' cache miss for key ' + keyed_value);
        }

        function purge() {
            data_store[type] = [];
        }

        function del(keyed_value, by) {
            if (by) {
                var instance = lookup(keyed_value, by);
                if (!instance) {
                    console.error('Could not find model cache entry to delete.');
                    return;
                }
                keyed_value = instance[key];
            }
            delete data_store[type][keyed_value];
        }

        return {
            cast: cast,
            data_store: data_store,
            del: del,
            flush: flush,
            get: get,
            lookup: lookup,
            purge: purge,
            uncast: uncast
        };
    };

});
