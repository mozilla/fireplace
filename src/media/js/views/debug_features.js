define('views/debug_features',
    ['compatibility_filtering', 'core/settings', 'core/urls'],
    function(compatibility_filtering, settings, urls) {
    'use strict';

    return function(builder, args, params) {
        params = params || {};

        // Force feature profile to be sent even if it's blacklisted.
        params.pro = compatibility_filtering.feature_profile;

        builder.start('debug_features.html', {
            endpoint: urls.api.unsigned.url('features', [], params),
            profile: compatibility_filtering.feature_profile
        });
    };
});
