define('z', ['jquery'], function($) {
    return {
        win: $(window),
        doc: $(document),
        body: $(document.body),
        container: $('main'),
        page: $('#page'),
        apps: {},
        context: {},
        spaceheater: !!document.body.getAttribute('data-spaceheater')
    };
});
