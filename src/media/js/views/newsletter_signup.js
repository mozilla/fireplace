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

        // Tapping before scrolling on FxOS 2.0+ will cause you to select an
        // element below the one you tapped. Let's do the initial scroll so
        // things just work (bug 1151762).
        window.scrollTo(0, 1);
        window.scrollTo(0, 0);
    };
});
