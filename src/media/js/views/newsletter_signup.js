define('views/newsletter_signup',
    ['user', 'user_helpers'],
    function(user, user_helpers) {
    'use strict';

    return function(builder, args) {
        builder.start('newsletter.html', {
            standalone_newsletter_signup: true,
            user_email: user.get_setting('email'),
            user_lang: user_helpers.lang(),
        });
        builder.z('type', 'root settings');
    };
});
