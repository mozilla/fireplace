define('models', ['requests'], function(requests) {

    // {'type': {'<id>': object}}
    var data_store = {};

    var prototypes = {
        'app': 'slug',
        'rating': 'id'
    };

    return function(type) {
        if (!(type in prototypes)) {
            throw new Exception('Unknown model "' + type + '"');
        }

        if (!(type in data_store)) {
            // Where's defaultdict when you need it
            data_store[type] = {};
        }

        var key = prototypes[type];

        var cast = function(data) {
            if(_.isArray(data)) {
                _.each(data, cast);
                return;
            }
            var keyed_value = data[key];
            data_store[type][keyed_value] = data;
        }

        var fetch = function(url, keyed_value) {
            if (false &&keyed_value in data_store[type]) {
                // Call the `.done()` function back in `request()`.
                return $.Deferred().resolve(data_store[type][keyed_value]);
            }

            return requests.get(url);
        }

        return {
            cast: cast,
            fetch: fetch
        };
    };

});
