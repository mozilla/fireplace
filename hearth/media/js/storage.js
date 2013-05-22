define('storage', [], function() {
    // U MAD?
    try {
        return localStorage;
    } catch(e) {
        return {
            clear: function() {},
            getItem: function() {},
            removeItem: function() {},
            setItem: function() {}
        };
    }
});
