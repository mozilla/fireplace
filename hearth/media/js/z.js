define('z', ['jquery', 'settings', 'underscore'], function($, settings, _) {
    var z = {
        win: $(window),
        doc: $(document),
        body: $(document.body),
        container: $('#container'),
        page: $('#page'),
        canInstallApps: true,
        state: {}
    };

    var data_user = z.body.data('user');

    _.extend(z, {
        allowAnonInstalls: !!z.body.data('allow-anon-installs'),
        enableSearchSuggestions: !!z.body.data('enable-search-suggestions'),
        anonymous: data_user ? data_user.anonymous : false,
        pre_auth: data_user ? data_user.pre_auth : false
    });

    return z;
});
