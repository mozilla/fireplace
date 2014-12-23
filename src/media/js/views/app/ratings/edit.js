define('views/app/ratings/edit',
    ['cache', 'forms', 'l10n', 'notification', 'ratings', 'requests',
     'settings', 'urls', 'user', 'utils', 'z'],
    function(cache, forms, l10n, notification, ratings, requests,
             settings, urls, user, utils, z) {
    var gettext = l10n.gettext;
    var notify = notification.notification;

    z.doc.on('submit', '.edit-review-form', utils._pd(function(e) {
        var $this = $(this);
        var resource_uri = $this.data('uri');
        var uri = settings.api_url + urls.api.sign(resource_uri);
        var data = utils.getVars($this.serialize());
        var slug = data.app;

        forms.toggleSubmitFormState($this);

        requests.put(uri, data).done(function(data) {
            notify({message: gettext('Your review was successfully edited')});

            // Rewrite cache with new review.
            cache.set(uri, data);
            ratings._rewriter(slug, function(reviews) {
                reviews.objects.forEach(function(obj, i) {
                    if (reviews.objects[i].resource_uri === resource_uri) {
                        reviews.objects[i].body = data.body;
                        reviews.objects[i].rating = data.rating;
                    }
                });
                return reviews;
            });

            z.page.trigger('navigate', urls.reverse('app', [slug]));
        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('Sorry, there was an issue editing your review. Please try again later')});
        });
    }))

    function normalize(inbound) {
        // Normalizes the inbound API response in case list is returned.
        return inbound.objects ? inbound.objects[0] : inbound;
    }

    return function(builder, args) {
        var slug = args[0];
        builder.z('type', 'leaf');
        builder.z('title', gettext('Edit Review'));

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
