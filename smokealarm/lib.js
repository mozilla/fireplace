
function fake_login(suite) {
    suite.evaluate(function() {
        console.log('[*][phantom] Performing fake login action');
        window.require('user').set_token("it's fine, it's fine");
        window.require('user').update_apps({
            'installed': [],
            'developed': [424242],  // Hardcoded in flue as the id for the 'developer' app.
            'purchased': []
        });
        var z = window.require('z');
        z.body.addClass('logged-in');
        z.page.trigger('reload_chrome');
        z.page.trigger('logged_in');

        require('views').reload();
    });
}

if (typeof window !== 'undefined') {
    // Casper mode
    exports.fake_login = fake_login;
} else {
    // Node mode
    module.exports.fake_login = fake_login;
}
