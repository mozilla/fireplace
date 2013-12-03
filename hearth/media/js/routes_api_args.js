define('routes_api_args',
    ['buckets', 'capabilities', 'user'],
    function(buckets, caps, user) {

    function _dev() {
        if (caps.firefoxOS) {
            return 'firefoxos';
        } else if (caps.firefoxAndroid) {
            return 'android';
        }
    }

    function _device() {
        // TODO: Deprecate this. (This was a quick fix for bug 875495 until buchets land.)
        if (caps.firefoxOS) {
            return 'firefoxos';
        } else if (caps.firefoxAndroid) {
            if (caps.widescreen()) {
                return 'tablet';
            }
            return 'mobile';
        }
    }

    return function() {
        return {
            lang: (navigator.l10n && navigator.l10n.language) || navigator.language || navigator.userLanguage,
            region: user.get_setting('region') || '',
            carrier: user.get_setting('carrier') || '',
            true_region: user.get_setting('true_region') || '',
            true_carrier: user.get_setting('true_carrier') || '',
            dev: _dev(),
            device: _device(),
            pro: buckets.get_profile()
        };
    };

});
