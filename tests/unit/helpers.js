define('tests/unit/helpers',
    ['core/format', 'Squire', 'underscore'],
    function(format, Squire, _) {

    var exports = {
        injector: function() {
            var Squire = require('Squire');
            var injector = new Squire();
            _.each(arguments, function(mock) {
                mock(injector);
            });
            return injector;
        },
        mockDeviceTypeCapabilities: function(hasWebApps) {
            return function(injector) {
                return injector.mock('core/capabilities', {
                    device_type: function() {return 'foo';},
                    webApps: hasWebApps
                });
            };
        },
        mockSettings: function(settings) {
            return function(injector) {
                injector.mock('core/settings', settings || {});
            };
        },
        setL10nStrings: function(strings, test) {
            var initialStrings = navigator.l10n.strings;
            var newStrings = Object.keys(strings).reduce(function(memo, id) {
                memo[id] = strings[id];
                return memo;
            }, {});
            console.log(format.format('Got l10n strings {strings}', {
                strings: JSON.stringify(strings),
            }));
            console.log(format.format('Mapped l10n strings {newStrings}', {
                newStrings: JSON.stringify(newStrings),
            }));
            try {
                navigator.l10n.strings = newStrings;
                console.log(format.format('Set navigator.l10n {nav}', {
                    nav: JSON.stringify(navigator.l10n),
                }));
                test();
            } finally {
                navigator.l10n.strings = initialStrings;
            }
        },
    };

    return exports;
});
