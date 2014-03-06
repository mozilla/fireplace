define('views/debug_features',
    ['buckets', 'settings', 'urls'],
    function(buckets, settings, urls) {
    'use strict';

    return function(builder, args, params) {
        params = params || {};

        // Force feature profile to be sent even if it's blacklisted.
        params['pro'] = buckets.profile;

        builder.start('debug_features.html', {
            endpoint: urls.api.unsigned.url('features', [], params),
        });
    };
});
