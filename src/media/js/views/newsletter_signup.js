define('views/newsletter_signup',
    ['core/l10n', 'core/user', 'newsletter', 'underscore', 'user_helpers'],
    function(l10n, user, newsletter, underscore, user_helpers) {
    'use strict';
    var gettext = l10n.gettext;

    return function(builder, args) {
        var context = {
            standalone_newsletter_signup: true,
        };
        _.extend(context, newsletter.context());
        builder.start('newsletter.html', context);
        builder.z('type', 'root settings');
        var title = gettext('Newsletter Signup');
        builder.z('title', title);
        builder.z('header-title', title);

        // Tapping before scrolling on FxOS 2.0+ will cause you to select an
        // element below the one you tapped. Let's do the initial scroll so
        // things just work (bug 1151762).
        window.scrollTo(0, 1);
        window.scrollTo(0, 0);
    };
});
