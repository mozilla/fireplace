define('views/newsletter_signup',
    ['user'],
    function(user) {
    'use strict';

    return function(builder, args) {
        builder.start('newsletter.html', {
            standalone_newsletter_signup: true,
            email: user.get_setting('email'),
        });
        builder.z('type', 'root settings');
    };
});
