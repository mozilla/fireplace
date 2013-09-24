define('z', ['jquery'], function($) {
    return {
        win: $(window),
        doc: $(document),
        body: $(document.body),
        container: $('main'),
        page: $('#page'),
        canInstallApps: true,
        apps: {},
        flags: {},
        context: {},
        spaceheater: !!document.body.getAttribute('data-spaceheater')
    };
});
