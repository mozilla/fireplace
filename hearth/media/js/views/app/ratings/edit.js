define(
    ['l10n', 'notification', 'requests', 'settings', 'urls', 'user', 'z'],
    function(l10n, notification, requests, settings, urls, user, z) {

    var gettext = l10n.gettext;
    var notify = notification.notification;

    z.page.on('submit', '.edit-review-form', function(e) {
        e.preventDefault();
        var $this = $(this);
        requests.put(
            settings.api_url + urls.api.sign($this.data('uri')),
            $this.serialize()
        ).done(function() {
            notify({message: gettext('Review updated successfully')});
            z.page.trigger('navigate', urls.reverse('app', [$this.data('slug')]));
        }).fail(function() {
            notify({message: gettext('There was a problem updating your review')});
        });
    });

    return function(builder, args) {
        var slug = args[0];

        // If the user isn't logged in, divert them to the app detail page.
        // I'm not concerned with trying to log them in because they shouldn't
        // have even gotten to this page in their current state anyway.
        if (!user.logged_in()) {
            z.page.trigger('navigate', urls.reverse('app', [slug]));
            return;
        }

        builder.start('ratings/edit.html', {
            'slug': slug
        });

        // If we hit the API and find out that there's no review for the user,
        // just bump them over to the Write a Review page.
        builder.onload('main', function(data) {
            if (data.meta.total_count === 0) {
                z.page.trigger('divert', urls.reverse('app/ratings/add', [slug]));
            }
        });

        builder.z('type', 'leaf');
        builder.z('reload_on_login', true);
        builder.z('title', gettext('Edit Review'));
    };
});
