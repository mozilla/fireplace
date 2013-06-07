define('browser', [], function() {
    'use strict';

    var osStrings = {
        'windows': 'Windows',
        'mac': 'Mac',
        'linux': 'Linux',
        'android': 'Android'
    };

    var os = {};
    var platform = '';
    for (var i in osStrings) {
        if (navigator.userAgent.indexOf(osStrings[i]) !== -1) {
            return i;
        }
    }
    return 'other';
});
