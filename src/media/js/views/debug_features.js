define('views/debug_features',
    ['compat_filter', 'core/settings', 'core/urls'],
    function(compatFilter, settings, urls) {
    'use strict';

    return function(builder, args, params) {
        params = params || {};

        // Force feature profile to be sent even if it's blacklisted.
        params.pro = compatFilter.featureProfile;

        builder.start('debug_features.html', {
            endpoint: urls.api.unsigned.url('features', [], params),
            profile: params.pro
        });
    };
});
