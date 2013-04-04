
define('browser', ['utils'], function(utils) {
    'use strict';

    var osStrings = {
        'windows': 'Windows',
        'mac': 'Mac',
        'linux': 'Linux',
        'android': 'Android',
        'maemo': 'Maemo'
    };

    var os = {};
    var platform = '';
    for (i in osStrings) {
        if (osStrings.hasOwnProperty(i)) {
            pattern = osStrings[i];
            os[i] = navigator.userAgent.indexOf(pattern) != -1;
            if (os[i]) {
                platform = i;
            }
        }
    }
    if (!platform) {
        os['other'] = !platform;
        platform = 'other';
    }

    return {
        os: os,
        platform: platform
    };
});
