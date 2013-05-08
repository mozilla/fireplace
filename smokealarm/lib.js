
function fake_login(suite) {
    suite.evaluate(function() {
        console.log('[*][phantom] Performing fake login action');
        window.require('user').set_token("it's fine, it's fine");
        var z = window.require('z');
        z.body.addClass('logged-in');
        z.page.trigger('reload_chrome');
        z.page.trigger('logged_in');

        if (z.context.reload_on_login) {
            require('views').reload().done(resolve_pending);
        }
    });
}


if (typeof window !== 'undefined') {
    // Casper mode
    exports.fake_login = fake_login;
} else {
    // Node mode
    module.exports.fake_login = fake_login;
}
