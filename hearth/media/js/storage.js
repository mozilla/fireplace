define('storage', ['settings'], function(settings) {
    // U MAD?
    // OH I MAD

    function prefix(func) {
        return function() {
            var args = Array.prototype.slice.call(arguments, 0);
            args[0] = settings.storage_version + '::' + args[0];
            return func.apply(localStorage, args);
        }
    }

    try {
        var ls = localStorage;
        return {
            clear: function() {ls.clear();},
            getItem: prefix(ls.getItem),
            removeItem: prefix(ls.removeItem),
            setItem: prefix(ls.setItem)
        };
    } catch(e) {
        // TODO: Try saving this to a cookie or something?
        return {
            clear: function() {},
            getItem: function() {},
            removeItem: function() {},
            setItem: function() {}
        };
    }
});
