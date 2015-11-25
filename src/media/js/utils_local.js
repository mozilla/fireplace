define('utils_local',
    ['core/defer', 'core/log', 'core/settings', 'core/urls', 'core/z',
     'jquery', 'salvattore', 'underscore'],
    function(defer, log, settings, urls, z,
             $, salvattore, _) {

    var logger = log('utils_local');
    var check_interval;

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

    function initSalvattore(elem) {
        // Initializes Salvattore layout on an element.
        if (elem) {
            salvattore.register_grid(elem);
        }

        var width = z.win.width();
        z.win.on('resize', _.debounce(function() {
            var newWidth = z.win.width();
            if (newWidth !== width) {
                salvattore.recreate_columns(elem);
                width = newWidth;
            }
        }, 100));
    }

    function headerTitle(title) {
        document.getElementById('global-header')
                .setAttribute('header-title', title);
        $('.mkt-header--title').text(title);
    }

    return {
        build_localized_field: build_localized_field,
        headerTitle: headerTitle,
        initSalvattore: initSalvattore,
        items: items,
    };

});
