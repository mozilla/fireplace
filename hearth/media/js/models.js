define('models', ['requests', 'underscore'], function(requests, _) {

    // {'type': {'<id>': object}}
    var data_store = {};

    var prototypes = {
        'app': 'slug',
        'category': 'slug',

        // Dummy prototypes to facilitate testing
        'dummy': 'id',
        'dummy2': 'id'
    };

    return function(type) {
        if (!(type in prototypes)) {
            throw new Error('Unknown model "' + type + '"');
        }

        if (!(type in data_store)) {
            // Where's defaultdict when you need it
            data_store[type] = {};
        }

        var key = prototypes[type];

        var cast = function(data) {
            if (_.isArray(data)) {
                _.each(data, cast);
                return;
            }
            var keyed_value = data[key];
            data_store[type][keyed_value] = data;
            console.log('[model] Stored ' + keyed_value + ' as ' + type);
        };

        var get = function(url, keyed_value, getter) {
            getter = getter || requests.get;

            if (keyed_value) {
                if (keyed_value in data_store[type]) {
                    // Call the `.done()` function back in `request()`.
                    console.log('[model] Found ' + type + ' with key ' + keyed_value);
                    return $.Deferred()
                            .resolve(data_store[type][keyed_value])
                            .promise({__cached: true});
                }

                console.log('[model] ' + type + ' cache miss for key ' + keyed_value);
            }

            return getter(url);
        };

        var lookup = function(keyed_value, by) {
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
                console.log('[model] Found ' + type + ' with lookup key ' + keyed_value);
                return data_store[type][keyed_value];
            }

            console.log('[model] ' + type + ' cache miss for key ' + keyed_value);
        };

        var purge = function() {
            data_store[type] = [];
        }

        return {
            cast: cast,
            get: get,
            lookup: lookup,
            purge: purge
        };
    };

});
