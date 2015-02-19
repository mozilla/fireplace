define('tests/unit/compatibility_filtering',
    ['tests/unit/helpers'],
    function(helpers) {

    function desktopCapabilities(injector) {
        return injector.mock('core/capabilities', {
            device_platform: function() { return 'desktop'; },
            device_formfactor: function() { return ''; },
            device_type: function() { return 'desktop'; },
        });
    }

    function androidCapabilities(format) {
        return function(injector) {
            return injector.mock('core/capabilities', {
                device_platform: function() { return 'android'; },
                device_formfactor: function() { return format; },
                device_type: function() { return 'android-' + format; },
            });
        };
    }

    function firefoxOSCapabilities(injector) {
        return injector.mock('core/capabilities', {
            device_platform: function() { return 'firefoxos'; },
            device_formfactor: function() { return ''; },
            device_type: function() { return 'firefoxos'; },
        });
    }

    function noStorage(injector) {
        return injector.mock('core/storage', {
            getItem: function() { return null; },
        });
    }

    describe('compatibility_filtering', function() {
        it('api_args desktop',
            helpers
            .injector(noStorage, desktopCapabilities)
            .mock('core/utils', {
                getVars: function() { return {}; },
            }).run(['compatibility_filtering'], function(compatibility_filtering) {
                var args = compatibility_filtering.api_args('');
                assert.equal(args.dev, '');
                assert.equal(args.device, '');
                assert.equal(args.limit, 24);
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('category_landing');
                assert.equal(args.dev, '');
                assert.equal(args.device, '');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, '');
                assert.equal(args.device, '');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('new_popular_search');
                assert.equal(args.dev, '');
                assert.equal(args.device, '');
                assert.equal(args.pro, undefined);

                assert.equal(compatibility_filtering.device_filter_name, '');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), true);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);
            }));

        it('api_args desktop override',
            helpers
            .injector(desktopCapabilities, noStorage)
            .mock('core/utils', {
                getVars: function() { return {'device_override': 'desktop'}; },
            }).run(['compatibility_filtering'], function(compatibility_filtering) {
                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, 'desktop');
                assert.equal(args.device, '');
                assert.equal(args.limit, 24);
                assert.equal(args.pro, undefined);

                assert.equal(compatibility_filtering.device_filter_name, '');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), true);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);
            }));

        it('compatibility_filtering api_args desktop override firefoxos',
            helpers.injector(desktopCapabilities, noStorage).mock('core/utils', {
                getVars: function() { return {'device_override': 'firefoxos'}; },
            }).run(['compatibility_filtering'], function(compatibility_filtering) {
                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.limit, 24);
                assert.equal(args.pro, undefined);

                assert.equal(compatibility_filtering.device_filter_name, '');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), true);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);
            }));

        it('api_args endpoint desktop w/ storage',
            helpers
            .injector(desktopCapabilities)
            .mock('core/storage', {
                getItem: function(key) {
                    console.log('getting ' + key);
                    if (key == 'device_filtering_preferences') {
                        return {
                            'new_popular_search': 'android-mobile',
                            'search': 'desktop',
                        };
                    }
                },
            }).run(['compatibility_filtering'], function(compatibility_filtering) {
                var args = compatibility_filtering.api_args('');
                assert.equal(args.dev, '');
                assert.equal(args.device, '');
                assert.equal(args.limit, 24);
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('category_landing');
                assert.equal(args.dev, '');
                assert.equal(args.device, '');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, 'desktop');
                assert.equal(args.device, '');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('new_popular_search');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'mobile');
                assert.equal(args.pro, undefined);

                assert.equal(compatibility_filtering.device_filter_name, '');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), true);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);
            }));

        it('api_args endpoint android mobile',
            helpers
            .injector(androidCapabilities('mobile'), noStorage)
            .run(['compatibility_filtering'], function(compatibility_filtering) {
                var args = compatibility_filtering.api_args('');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'mobile');
                assert.equal(args.limit, 10);
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('category_landing');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'mobile');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'mobile');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('new_popular_search');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'mobile');
                assert.equal(args.pro, undefined);

                assert.equal(compatibility_filtering.device_filter_name, 'android-mobile');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', ''), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), true);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);
            }));

        it('api_args endpoint android tablet',
            helpers
            .injector(androidCapabilities('tablet'), noStorage)
            .run(['compatibility_filtering'], function(compatibility_filtering) {
                var args = compatibility_filtering.api_args('');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'tablet');
                assert.equal(args.limit, 24);
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('category_landing');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'tablet');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'tablet');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('new_popular_search');
                assert.equal(args.dev, 'android');
                assert.equal(args.device, 'tablet');
                assert.equal(args.pro, undefined);

                assert.equal(compatibility_filtering.device_filter_name, 'android-tablet');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', ''), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), true);
            }));

        it('api_args endpoint firefoxos',
            helpers
            .injector(firefoxOSCapabilities, noStorage)
            .run(['compatibility_filtering'], function(compatibility_filtering) {
                var args = compatibility_filtering.api_args('');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.limit, 10);
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('category_landing');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, compatibility_filtering.default_feature_profile);

                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, compatibility_filtering.default_feature_profile);

                args = compatibility_filtering.api_args('new_popular_search');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, compatibility_filtering.default_feature_profile);

                assert.equal(compatibility_filtering.device_filter_name, 'firefoxos');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', ''), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), true);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);
            }));

        it('api_args endpoint firefoxos w/ profiled passed by query string',
            helpers
            .injector(firefoxOSCapabilities, noStorage)
            .mock('core/utils', {
                getVars: function() { return {'pro': 'dummy-profile'}; },
            }).run(['compatibility_filtering'], function(compatibility_filtering) {
                var args = compatibility_filtering.api_args('');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.limit, 10);
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('category_landing');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, 'dummy-profile');

                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, 'dummy-profile');

                args = compatibility_filtering.api_args('feed');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, 'dummy-profile');

                args = compatibility_filtering.api_args('new_popular_search');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, 'dummy-profile');

                assert.equal(compatibility_filtering.device_filter_name, 'firefoxos');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', ''), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), true);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);
            }));

        it('api_args endpoint firefoxos w/ storage',
            helpers
            .injector(firefoxOSCapabilities)
            .mock('core/storage', {
                getItem: function(key) {
                    if (key == 'device_filtering_preferences') {
                        return {
                            'category_landing': 'all',
                            'search': ''
                        };
                    }
                },
            }).run(['compatibility_filtering'], function(compatibility_filtering) {
                var args = compatibility_filtering.api_args('');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.limit, 10);
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('category_landing');
                assert.equal(args.dev, '');
                assert.equal(args.device, '');
                assert.equal(args.pro, undefined);

                args = compatibility_filtering.api_args('search');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, compatibility_filtering.default_feature_profile);

                args = compatibility_filtering.api_args('feed');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, compatibility_filtering.default_feature_profile);

                args = compatibility_filtering.api_args('new_popular_search');
                assert.equal(args.dev, 'firefoxos');
                assert.equal(args.device, '');
                assert.equal(args.pro, compatibility_filtering.default_feature_profile);

                assert.equal(compatibility_filtering.device_filter_name, 'firefoxos');

                assert.equal(compatibility_filtering.is_preference_selected('search', 'all'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', ''), true);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'desktop'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'firefoxos'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-mobile'), false);
                assert.equal(compatibility_filtering.is_preference_selected('search', 'android-tablet'), false);
            }));
    });
});
