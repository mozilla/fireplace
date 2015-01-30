define('views/newsletter_signup',
    ['newsletter', 'underscore', 'core/user', 'user_helpers'],
    function(newsletter, underscore, user, user_helpers) {
    'use strict';

    return function(builder, args) {
        var context = {
            standalone_newsletter_signup: true,
        };
        _.extend(context, newsletter.context());
        builder.start('newsletter.html', context);
        builder.z('type', 'root settings');
    };
});
