define('storage', ['settings'], function(settings) {
    var fakeStorage = {};

    var ls;
    try { ls = localStorage;}
    catch(e) {}

    function prefix(func, backup_func) {
        return function() {
            var args = Array.prototype.slice.call(arguments, 0);
            args[0] = settings.storage_version + '::' + args[0];
            try {
                return func.apply(ls, args);
            } catch(e) {
                return backup_func.apply(fakeStorage, args);
            }
        };
    }

    return {
        clear: function() {
            try { ls.clear(); }
            catch(e) { fakeStorage = {}; }
        },
        getItem: prefix(
            ls.getItem,
            function(key) { return this[key]; }
        ),
        removeItem: prefix(
            ls.removeItem,
            function(key) { delete this[key]; }
        ),
        setItem: prefix(
            ls.setItem,
            function(key, value) { this[key] = value; }
        )
    };
});
