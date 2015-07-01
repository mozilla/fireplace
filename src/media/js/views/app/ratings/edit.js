define('views/app/ratings/edit',
    ['core/l10n', 'core/urls', 'core/user', 'core/utils', 'core/z',
     'utils_local'],
    function(l10n, urls, user, utils, z,
             utilsLocal) {
    var gettext = l10n.gettext;

    function normalize(inbound) {
        // Normalizes the inbound API response in case list is returned.
        return inbound.objects ? inbound.objects[0] : inbound;
    }

    return function(builder, args) {
        var slug = decodeURIComponent(args[0]);
        var title = gettext('Edit Review');
        builder.z('type', 'leaf');
        builder.z('title', title);
        utilsLocal.headerTitle(title);

        if (!user.logged_in()) {
            // If user not logged in, divert to app detail page.
            z.page.trigger('divert', urls.reverse('app', [slug]));
            return;
        }

        var review_id = utils.getVars().review;
        var endpoint;
        if (review_id && user.get_permission('reviewer')) {
            // Allow exact review lookups for admins.
            endpoint = urls.api.url('review', [review_id]);
        } else {
            // Otherwise user is limited to their own review.
            endpoint = urls.api.params('reviews', {
                app: slug,
                user: 'mine'
            });
        }

        builder.start('ratings/edit.html', {
            'slug': slug,
            'endpoint': endpoint,
            'normalize': normalize
        });

        builder.onload('main', function(data) {
            // If we find out that there's no review from user, go to Add page.
            if (data.meta && data.meta.total_count === 0) {
                z.page.trigger('divert', urls.reverse('app/ratings/add', [slug]));
            }
        });
    };
});
