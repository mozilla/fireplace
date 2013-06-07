define('z', ['jquery', 'underscore'], function($, _) {
    var z = {
        win: $(window),
        doc: $(document),
        body: $(document.body),
        container: $('main'),
        page: $('#page'),
        canInstallApps: true,
        state: {},
        apps: {},
        flags: {},
        context: {}
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
