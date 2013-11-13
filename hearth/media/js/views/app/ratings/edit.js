define('views/app/ratings/edit',
    ['l10n', 'notification', 'ratings', 'requests', 'settings', 'urls', 'user', 'utils', 'z'],
    function(l10n, notification, ratings, requests, settings, urls, user, utils, z) {

    var gettext = l10n.gettext;
    var notify = notification.notification;
    var forms = require('forms');
    var caps = require('capabilities');

    z.page.on('submit', '.edit-review-form', function(e) {
        e.preventDefault();
        var $this = $(this);
        var uri = $this.data('uri');
        var slug = $this.data('slug');
        var _data = utils.getVars($this.serialize());

        forms.toggleSubmitFormState($this);

        requests.put(
            settings.api_url + urls.api.sign(uri),
            _data
        ).done(function() {
            notify({message: gettext('Review updated successfully')});

            ratings._rewriter(slug, function(data) {
                for (var i = 0; i < data.objects.length; i++) {
                    if (data.objects[i].resource_uri === uri) {
                        data.objects[i].body = _data.body;
                        data.objects[i].rating = _data.rating;
                    }
                }
                return data;
            });

            z.page.trigger('navigate', urls.reverse('app', [slug]));
        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('There was a problem updating your review')});
        });
    }).on('click', '.edit-review-form .cancel', function(e) {
        e.preventDefault();
        var slug = $(this).closest('.edit-review-form').data('slug');
        z.page.trigger('navigate', urls.reverse('app', [slug]));
    });

    function normalize(inbound) {
        // This function normalizes the inbound API response. If we get a
        // single review vs. a list containing a single review, this will
        // return the expected version.
        return inbound.objects ? inbound.objects[0] : inbound;
    }

    return function(builder, args) {
        var slug = args[0];

        // If the user isn't logged in, divert them to the app detail page.
        // I'm not concerned with trying to log them in because they shouldn't
        // have even gotten to this page in their current state anyway.
        if (!user.logged_in()) {
            z.page.trigger('divert', urls.reverse('app', [slug]));
            return;
        }

        var review_id = utils.getVars().review;
        var endpoint;
        if (review_id && user.get_permission('reviewer')) {
            // Allow exact review lookups for admins.
            endpoint = urls.api.params('review', [review_id]);
        } else {
            // Otherwise the user is limited to their own review for the app.
            endpoint = urls.api.params('reviews', {app: slug, user: 'mine'});
        }

        builder.start(
            'ratings/edit.html',
            {'slug': slug, 'endpoint': endpoint, 'normalize': normalize}
        );

        // If we hit the API and find out that there's no review for the user,
        // just bump them over to the Write a Review page.
        builder.onload('main', function(data) {
            if (data.meta.total_count === 0) {
                z.page.trigger('divert', urls.reverse('app/ratings/add', [slug]));
            }
        });

        builder.z('type', 'leaf');
        builder.z('parent', urls.reverse('app/ratings', [slug]));
        builder.z('title', gettext('Edit Review'));
    };
});
