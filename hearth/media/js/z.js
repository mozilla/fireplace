define('z', ['jquery'], function($) {
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
    z.spaceheater = z.body.data('spaceheater');
    return z;
});
