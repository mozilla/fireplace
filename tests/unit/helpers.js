define('tests/unit/helpers',
    ['Squire', 'underscore'],
    function(Squire, _) {

    var exports = {
        injector: function() {
            var Squire = require('Squire');
            var injector = new Squire();
            _.each(arguments, function(mock) {
                mock(injector);
            });
            return injector;
        },
        mockSettings: function (settings) {
            return function(injector) {
                injector.mock('core/settings', settings || {});
            };
        },
    };

    return exports;
});
