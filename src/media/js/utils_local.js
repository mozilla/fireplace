define('utils_local', ['log'], function(log) {
    var console = log('utils_local');

    function isSystemDateRecent() {
        var rval = new Date().getFullYear() >= 2010;
        if (!rval) {
            console.log('System date appears to be incorrect!');
        }
        return rval;
    }

    return {
        isSystemDateRecent: isSystemDateRecent
    };
});
