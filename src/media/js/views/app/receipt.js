define('views/app/receipt',
    ['core/capabilities', 'core/l10n', 'core/login', 'core/notification', 'templates', 'core/urls',
     'core/user', 'core/z'],
    function(caps, l10n, login, notification, nunjucks, urls,
             user, z) {
    var gettext = l10n.gettext;
    var notify = notification.notification;

    return function(builder, args) {
        var slug = decodeURIComponent(args[0]);
        if (!user.logged_in()) {
            // If the user isn't logged in, redirect to detail page.
            notify({message: gettext('Please sign in to view the receipt')});

            z.page.trigger('divert', urls.reverse('app', [slug]));
            return;
        }

        builder.z('type', 'leaf detail');
        builder.z('parent', urls.reverse('app', [args[0]]));
        builder.z('title', gettext('Receipt'));
        builder.start('app/receipt.html', {slug: args[0]});
    };
});
