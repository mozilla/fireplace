define('routes_api_args',
    ['buckets', 'capabilities', 'user_helpers'],
    function(buckets, caps, user_helpers) {

    var _dev = null;
    var _device = null;
    var _limit = 25;

    if (caps.firefoxOS) {
        _dev = _device = 'firefoxos';
    } else if (caps.firefoxAndroid) {
        _dev = 'android';
        _device = caps.widescreen() ? 'tablet' : 'mobile';
    }

    if (_device == 'mobile' || _device == 'firefoxos') {
        // For mobile phones, set limit to 10, otherwise use the default, 25.
        _limit = 10;
    }

    return function() {
        return {
            lang: (navigator.l10n && navigator.l10n.language) || navigator.language || navigator.userLanguage,
            region: user_helpers.region(undefined, true),
            carrier: user_helpers.carrier(),
            dev: _dev,
            device: _device,
            limit: _limit,
            pro: buckets.profile
        };
    };

});
