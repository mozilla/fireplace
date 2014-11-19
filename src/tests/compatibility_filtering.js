(function() {
var a = require('assert');
var eq_ = a.eq_;
var contains = a.contains;
var mock = a.mock;
var defer = require('defer');
var urls = require('urls');

test('compatibility_filtering api_args desktop', function(done, fail) {
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: false, firefoxAndroid: false},
            storage: {getItem: function() {}},
            utils: {getVars: function() { return {};}},
        },
        function(compatibility_filtering) {
            var args = compatibility_filtering.api_args('');
            eq_(args.dev, '');
            eq_(args.device, '');
            eq_(args.limit, 25);
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('category_landing');
            eq_(args.dev, '');
            eq_(args.device, '');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('search');
            eq_(args.dev, '');
            eq_(args.device, '');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('new_popular_search');
            eq_(args.dev, '');
            eq_(args.device, '');
            eq_(args.pro, undefined);

            eq_(compatibility_filtering.device_filter_name, '');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), true);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);

            done();
        },
        fail
    );
});

test('compatibility_filtering api_args desktop override', function(done, fail) {
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: false, firefoxAndroid: false},
            storage: {getItem: function() {}},
            utils: {getVars: function() { return {'device_override': 'desktop'};}},
        },
        function(compatibility_filtering) {
            args = compatibility_filtering.api_args('search');
            eq_(args.dev, 'desktop');
            eq_(args.device, '');
            eq_(args.limit, 25);
            eq_(args.pro, undefined);

            eq_(compatibility_filtering.device_filter_name, '');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), true);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);

            done();
        },
        fail
    );
});

test('compatibility_filtering api_args desktop override firefoxos', function(done, fail) {
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: false, firefoxAndroid: false},
            storage: {getItem: function() {}},
            utils: {getVars: function() { return {'device_override': 'firefoxos'};}},
        },
        function(compatibility_filtering) {
            args = compatibility_filtering.api_args('search');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.limit, 25);
            eq_(args.pro, undefined);

            eq_(compatibility_filtering.device_filter_name, '');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), true);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);

            done();
        },
        fail
    );
});

test('compatibility_filtering api_args endpoint desktop w/ storage', function(done, fail) {
    var stored_prefs = {
        'new_popular_search': 'android-mobile',
        'search': 'desktop',
    };
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: false, firefoxAndroid: false},
            storage: {getItem: function(key) { if (key == 'device_filtering_preferences') { return stored_prefs; }}},
        },
        function(compatibility_filtering) {
            var args = compatibility_filtering.api_args('');
            eq_(args.dev, '');
            eq_(args.device, '');
            eq_(args.limit, 25);
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('category_landing');
            eq_(args.dev, '');
            eq_(args.device, '');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('search');
            eq_(args.dev, 'desktop');
            eq_(args.device, '');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('new_popular_search');
            eq_(args.dev, 'android');
            eq_(args.device, 'mobile');
            eq_(args.pro, undefined);

            eq_(compatibility_filtering.device_filter_name, '');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), true);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);

            done();
        },
        fail
    );
});

test('compatibility_filtering api_args endpoint android mobile', function(done, fail) {
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: false, firefoxAndroid: true, widescreen: function() { return false; }},
            storage: {getItem: function() {}},
        },
        function(compatibility_filtering) {
            var args = compatibility_filtering.api_args('');
            eq_(args.dev, 'android');
            eq_(args.device, 'mobile');
            eq_(args.limit, 10);
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('category_landing');
            eq_(args.dev, 'android');
            eq_(args.device, 'mobile');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('search');
            eq_(args.dev, 'android');
            eq_(args.device, 'mobile');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('new_popular_search');
            eq_(args.dev, 'android');
            eq_(args.device, 'mobile');
            eq_(args.pro, undefined);

            eq_(compatibility_filtering.device_filter_name, 'android-mobile');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), false);
            eq_(compatibility_filtering.is_preference_selected('search', ''), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), true);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);

            done();
        },
        fail
    );
});

test('compatibility_filtering api_args endpoint android tablet', function(done, fail) {
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: false, firefoxAndroid: true, widescreen: function() { return true; }},
            storage: {getItem: function() {}},
        },
        function(compatibility_filtering) {
            var args = compatibility_filtering.api_args('');
            eq_(args.dev, 'android');
            eq_(args.device, 'tablet');
            eq_(args.limit, 25);
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('category_landing');
            eq_(args.dev, 'android');
            eq_(args.device, 'tablet');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('search');
            eq_(args.dev, 'android');
            eq_(args.device, 'tablet');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('new_popular_search');
            eq_(args.dev, 'android');
            eq_(args.device, 'tablet');
            eq_(args.pro, undefined);

            eq_(compatibility_filtering.device_filter_name, 'android-tablet');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), false);
            eq_(compatibility_filtering.is_preference_selected('search', ''), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), true);

            done();
        },
        fail
    );
});

test('compatibility_filtering api_args endpoint firefoxos', function(done, fail) {
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: true, firefoxAndroid: false},
            storage: {getItem: function() {}},
        },
        function(compatibility_filtering) {
            var args = compatibility_filtering.api_args('');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.limit, 10);
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('category_landing');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.pro, compatibility_filtering.default_feature_profile);

            args = compatibility_filtering.api_args('search');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.pro, compatibility_filtering.default_feature_profile);

            args = compatibility_filtering.api_args('new_popular_search');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.pro, compatibility_filtering.default_feature_profile);

            eq_(compatibility_filtering.device_filter_name, 'firefoxos');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), false);
            eq_(compatibility_filtering.is_preference_selected('search', ''), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), true);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);

            done();
        },
        fail
    );
});

test('compatibility_filtering api_args endpoint firefoxos w/ profiled passed by query string', function(done, fail) {
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: true, firefoxAndroid: false},
            storage: {getItem: function() {}},
            utils: {getVars: function() { return {'pro': 'dummy-profile'};}},
        },
        function(compatibility_filtering) {
            var args = compatibility_filtering.api_args('');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.limit, 10);
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('category_landing');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.pro, 'dummy-profile');

            args = compatibility_filtering.api_args('search');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.pro, 'dummy-profile');

            args = compatibility_filtering.api_args('new_popular_search');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.pro, 'dummy-profile');

            eq_(compatibility_filtering.device_filter_name, 'firefoxos');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), false);
            eq_(compatibility_filtering.is_preference_selected('search', ''), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), true);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);

            done();
        },
        fail
    );
});

test('compatibility_filtering api_args endpoint firefoxos w/ storage', function(done, fail) {
    var stored_prefs = {
        'category_landing': 'all',
        'search': ''
    };
    mock(
        'compatibility_filtering',
        {
            capabilities: {firefoxOS: true, firefoxAndroid: false},
            storage: {getItem: function(key) { if (key == 'device_filtering_preferences') { return stored_prefs; }}},
        },
        function(compatibility_filtering) {
            var args = compatibility_filtering.api_args('');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.limit, 10);
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('category_landing');
            eq_(args.dev, '');
            eq_(args.device, '');
            eq_(args.pro, undefined);

            args = compatibility_filtering.api_args('search');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.pro, compatibility_filtering.default_feature_profile);

            args = compatibility_filtering.api_args('new_popular_search');
            eq_(args.dev, 'firefoxos');
            eq_(args.device, '');
            eq_(args.pro, compatibility_filtering.default_feature_profile);

            eq_(compatibility_filtering.device_filter_name, 'firefoxos');

            eq_(compatibility_filtering.is_preference_selected('search', 'all'), false);
            eq_(compatibility_filtering.is_preference_selected('search', ''), true);
            eq_(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
            eq_(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);

            done();
        },
        fail
    );
});

})();