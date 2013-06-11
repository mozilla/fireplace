define('views/app/receipt',
       ['l10n', 'login', 'notification', 'urls', 'user', 'z'],
       function(l10n, login, n, urls, user, z) {

    var gettext = l10n.gettext;
    var notify = n.notification;

    return function(builder, args) {
        var slug = args[0];

        // If the user isn't logged in, redirect them to the detail page.
        if (!user.logged_in()) {
            notify({message: gettext('Please sign in to view the receipt')});

            z.page.trigger('divert', urls.reverse('app', [slug]));
            return;
        }

        builder.start('detail/receipt.html', {slug: args[0]});

        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [args[0]]));
        builder.z('reload_on_login', true);
        builder.z('title', gettext('Receipt'));
    };
});
