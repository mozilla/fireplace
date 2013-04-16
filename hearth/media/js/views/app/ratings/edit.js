define(['l10n', 'requests', 'urls', 'user', 'z'], function(l10n, requests, urls, user, z) {

    var gettext = l10n.gettext;

    z.page.on('submit', '.edit-review-form', function(e) {
        e.preventDefault();
        requests.put(
        ).done().fail();
    });

    return function(builder, args) {
        var slug = args[0];

        if (!user.logged_in()) {
            z.page.trigger('navigate', urls.reverse('app', [slug]))
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
