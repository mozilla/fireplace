define('utils_local', ['jquery', 'log'], function($, log) {
    var console = log('utils_local');

    var build_localized_field = function(name) {
        var data = {};
        $('.localized[data-name="' + name + '"]').each(function(i, field) {
            data[this.getAttribute('data-lang')] = this.value;
        });
        return data;
    };

    var items = function(obj) {
        // Like Python's dict.items().
        var items = [];
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var item = [];
            item.push(keys[i]);
            item.push(obj[keys[i]]);
            items.push(item);
        }
        return items;
    };

    return {
        build_localized_field: build_localized_field,
        items: items
    };
});
