define('views/app/receipt',
       ['capabilities', 'l10n', 'login', 'notification', 'templates', 'urls', 'user', 'z'],
       function(caps, l10n, login, n, nunjucks, urls, user, z) {

    var gettext = l10n.gettext;
    var notify = n.notification;

    z.page.on('click', '.abuse .button', function(e) {
        if (caps.widescreen()) {
            e.preventDefault();
            e.stopPropagation();
            z.body.trigger('decloak');
            $('.report-abuse.modal').addClass('show');
        }
    });

    return function(builder, args) {
        var slug = args[0];

        // If the user isn't logged in, redirect them to the detail page.
        if (!user.logged_in()) {
            notify({message: gettext('Please sign in to view the receipt')});

            z.page.trigger('divert', urls.reverse('app', [slug]));
            return;
        }

        builder.start('detail/receipt.html', {slug: args[0]});

        builder.onload('app-data', function() {
            if (caps.widescreen() && !$('.report-abuse').length) {
                z.page.append(
                    nunjucks.env.render('detail/abuse.html', {slug: slug})
                );
            }
        });

        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app', [args[0]]));
        builder.z('title', gettext('Receipt'));
    };
});
