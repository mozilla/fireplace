define('z', ['jquery', 'settings', 'underscore'], function($, settings, _) {
    var z = {
        win: $(window),
        doc: $(document),
        body: $(document.body),
        container: $('#container'),
        page: $('#page'),
        prefix: (function() {
            try {
                var s = window.getComputedStyle(document.body, '');
                return (Array.prototype.slice.call(s).join('').match(/moz|webkit|ms|khtml/)||(s.OLink===''&&['o']))[0];
            } catch (e) {
                return 'moz';
            }
        })(),
        prefixed: function(property) {
            if (!z.prefix) return property;
            return '-' + z.prefix + '-' + property;
        },
        canInstallApps: true,
        state: {}
    };

    var data_user = z.body.data('user');

    _.extend(z, {
        allowAnonInstalls: !!z.body.data('allow-anon-installs'),
        enableSearchSuggestions: !!z.body.data('enable-search-suggestions'),
        anonymous: data_user ? data_user.anonymous : false,
        pre_auth: data_user ? data_user.pre_auth : false,
        prefixUpper: z.prefix[0].toUpperCase() + z.prefix.substr(1)
    });

    return z;
});
