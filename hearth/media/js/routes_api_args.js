define('routes_api_args',
    ['buckets', 'capabilities', 'user_helpers'],
    function(buckets, caps, user_helpers) {

    var _dev = null;
    var _device = null;
    if (caps.firefoxOS) {
        _dev = _device = 'firefoxos';
    } else if (caps.firefoxAndroid) {
        _dev = 'android';
        _device = caps.widescreen() ? 'tablet' : 'mobile';
    }

    return function() {
        return {
            lang: (navigator.l10n && navigator.l10n.language) || navigator.language || navigator.userLanguage,
            region: user_helpers.region(undefined, true),
            carrier: user_helpers.carrier(),
            dev: _dev,
            device: _device,
            pro: buckets.profile
        };
    };

});
