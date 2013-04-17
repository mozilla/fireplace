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

        if (!user.logged_in()) {
            z.page.trigger('navigate', urls.reverse('app', [slug]));
            return;
        }

        builder.start('ratings/edit.html', {
            'slug': slug
        });

        builder.z('type', 'leaf');
        builder.z('reload_on_login', true);
        builder.z('title', gettext('Edit Review'));
    };
});
