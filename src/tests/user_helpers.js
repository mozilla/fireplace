(function() {
var a = require('assert');
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');
var urls = require('urls');

test('user_helpers carrier', function(done, fail) {
    var initial_args = {};
    var settings = {};
    mock(
        'user_helpers',
        {
            utils: {getVars: function() { return initial_args; }},
            user: {get_setting: function(key) { return settings[key];}}
        },
        function(user_helpers) {
            eq_(user_helpers.carrier(), '');

            settings.carrier_override = 'mycarrieroverride';
            settings.carrier_sim = 'mycarriersim';
            eq_(user_helpers.carrier(), 'mycarrieroverride');

            delete settings.carrier_override;
            eq_(user_helpers.carrier(), 'mycarriersim');

            initial_args.carrier = 'mycarrierinitial';
            eq_(user_helpers.carrier(), 'mycarrierinitial');
            done();
        },
        fail
    );
});

test('user_helpers region', function(done, fail) {
    var initial_args = {};
    var settings = {};
    mock(
        'user_helpers',
        {
            utils: {getVars: function() { return initial_args; }},
            user: {get_setting: function(key) { return settings[key];}},
        },
        function(user_helpers) {
            eq_(user_helpers.region(null, true), '');
            eq_(user_helpers.region('defaultregion', true), 'defaultregion');
            eq_(user_helpers.region(null, false), '');
            eq_(user_helpers.region('defaultregion', false), 'defaultregion');

            settings.region_geoip = 'myregiongeoip';
            eq_(user_helpers.region(null, true), '');
            eq_(user_helpers.region('defaultregion', true), 'defaultregion');
            eq_(user_helpers.region(null, false), 'myregiongeoip');
            eq_(user_helpers.region('defaultregion', false), 'myregiongeoip');

            initial_args.region = 'fakeregion';
            eq_(user_helpers.region(null, true), '');
            eq_(user_helpers.region('defaultregion', true), 'defaultregion');
            eq_(user_helpers.region(null, false), 'myregiongeoip');
            eq_(user_helpers.region('defaultregion', false), 'myregiongeoip');

            settings.region_sim = 'de';
            eq_(user_helpers.region(null, true), 'de');
            eq_(user_helpers.region('defaultregion', true), 'de');
            eq_(user_helpers.region(null, false), 'de');
            eq_(user_helpers.region('defaultregion', false), 'de');

            settings.region_override = 'us';
            eq_(user_helpers.region(null, true), 'us');
            eq_(user_helpers.region('defaultregion', true), 'us');
            eq_(user_helpers.region(null, false), 'us');
            eq_(user_helpers.region('defaultregion', false), 'us');

            initial_args.region = 'pl';
            eq_(user_helpers.region(null, true), 'pl');
            eq_(user_helpers.region('defaultregion', true), 'pl');
            eq_(user_helpers.region(null, false), 'pl');
            eq_(user_helpers.region('defaultregion', false), 'pl');

            done();
        },
        fail
    );
});

})();
