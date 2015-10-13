define('views/carrier',
    ['core/l10n', 'core/urls', 'user_helpers'],
    function(l10n, urls, userHelpers) {
    'use strict';

    var gettext = l10n.gettext;

    return function(builder, args, params) {
        var carrier_url = urls.api.url('late-customization', [], {
            carrier: userHelpers.carrier(),
            region: userHelpers.region(),
        });
        builder.z('type', 'root carrier-apps');
        builder.z('title', gettext('Free Carrier Apps'));
        builder.start('carrier.html', {
            carrier_url: carrier_url,
        });
    };
});
