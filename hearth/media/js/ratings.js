define('ratings',
    ['cache', 'capabilities', 'forms', 'jquery', 'l10n', 'login', 'models', 'settings', 'templates', 'tracking', 'underscore', 'utils', 'urls', 'user', 'z', 'requests', 'notification', 'common/ratingwidget'],
    function(cache, capabilities, forms, $, l10n, login, models, settings, nunjucks, tracking, _, utils, urls, user, z) {

    var gettext = l10n.gettext;
    var notify = require('notification').notification;

    var open_rating = false;

    function rewriter(app, processor) {
        var base_url = urls.api.base.url('reviews');
        cache.attemptRewrite(
            function(key) {
                if (utils.baseurl(key) !== base_url) {
                    return;
                }
                var kwargs = utils.querystring(key);
                if ('app' in kwargs && kwargs.app === app) {
                    return true;
                }
            },
            processor
        );
    }

    function flagReview($reviewEl) {
        var $modal = $('.report-spam');

        if (!$modal.length) {
            z.page.append(
                nunjucks.env.render('ratings/report.html')
            );
            $modal = $('.report-spam');
        }

        $modal.one('click', '.menu a', utils._pd(function(e) {
            var $actionEl = $reviewEl.find('.actions .flag');
            $('.cloak').trigger('dismiss');
            // L10n: The report is an abuse report for reviews
            $actionEl.text(gettext('Sending report...'));
            require('requests').post(
                require('settings').api_url + urls.api.sign($reviewEl.data('report-uri')),
                {flag: $(e.target).attr('href').replace('#', '')}
            ).done(function() {
                notify({message: gettext('Review flagged')});
                $actionEl.remove();
            }).fail(function() {
                // L10n: There was a problem submitting a report about a review.
                notify({message: gettext('Report review operation failed')});
            });
        }));

        z.body.trigger('decloak');
        $modal.addClass('show');
    }

    function deleteReview(reviewEl, uri, app) {
        reviewEl.addClass('deleting');
        require('requests').del(settings.api_url + urls.api.sign(uri)).done(function() {
            notify({message: gettext('Review deleted')});
            reviewEl.remove();

            // Update the app's review listing.
            rewriter(app, function(data) {
                data.objects = data.objects.filter(function(obj) {
                    return obj.resource_uri !== uri;
                });
                data.meta.total_count -= 1;
                if (!data.user) {
                    data.user = {};
                }
                data.user.has_rated = false;
                return data;
            });

            // Update the app model.
            var app_model;
            if (app_model = models('app').lookup(app)) {
                app_model.ratings.count -= 1;
                if (!app_model.ratings.count) {
                    app_model.ratings.average = 0;
                }
                // We cheat and don't update the average.
            }

            // Clear the user's review from the request cache.
            cache.bust(urls.api.params('reviews', {app: app, user: 'mine'}));

        }).fail(function() {
            notify({message: gettext('There was a problem deleting the review')});
        });
    }

    function loginToRate() {
        login.login().fail(function() {
            // Clear flag for open rating modal on cancel/fail of login.
            open_rating = false;
        });

        // Set a flag to know that we expect the modal to open
        // this prevents opening later if login was cancelled
        // as this flag is cleared in that case.
        open_rating = true;
        z.page.one('loaded', function(){
            if (open_rating){
                open_rating = false;
                var $reviewButton = $('.write-review');
                if ($reviewButton.attr('id') == 'edit-review') {
                    // load the edit view.
                    z.page.trigger('navigate', $reviewButton.attr('href'));
                } else {
                    // Do the write modal.
                    if (capabilities.widescreen()) {
                        $('.write-review').trigger('click');
                    } else {
                        z.page.trigger('navigate', $reviewButton.attr('href'));
                    }
                }
            }
        });
        return;
    }

    function addReview(e) {
        var $this = $(this);

        // If the user isn't logged in, prompt them to do so.
        if (!user.logged_in()) {
            e.preventDefault();
            e.stopPropagation();
            return loginToRate();
        }

        if (capabilities.widescreen()) {
            // For now, edits go through to the view.
            if (this.id === 'edit-review') {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            var $ratingModal = $('.compose-review.modal');
            if (!$ratingModal.length) {
                z.page.append(
                    nunjucks.env.render('ratings/write.html', {slug: $this.data('app')})
                );
                $ratingModal = $('.compose-review.modal');
            }

            z.body.trigger('decloak');
            $ratingModal.addClass('show');
            $ratingModal.find('select[name="rating"]').ratingwidget('large');
            utils.initCharCount();
        }
    }

    z.page.on('click', '.review .actions a', utils._pd(function(e) {
        var $this = $(this);
        var action = $this.data('action');
        if (!action) return;
        var $review = $this.closest('.review');
        switch (action) {
            case 'delete':
                deleteReview($review, $this.data('href'), $this.data('app'));
                break;
            case 'report':
                flagReview($review);
                break;
            case 'edit':
                var view = utils.urlparams($this.attr('href'), {review: $this.data('review-id')});
                z.page.trigger('navigate', view);
                break;
            default:
                return;
        }
        e.stopPropagation();  // Don't let the default handler fire if an action was matched.
    })).on('click', '.write-review', addReview)
    .on('loaded', function() {
        // Hijack <select> with stars.
        $('select[name="rating"]').ratingwidget();
        utils.initCharCount();
    });

    z.body.on('submit', 'form.add-review-form', function(e) {
        e.preventDefault();

        var $this = $(this);
        var app = $this.data('app');

        var data = utils.getVars($this.serialize());
        data.app = app;

        // This must be below `.serialize()`. Disabled form controls aren't posted.
        forms.toggleSubmitFormState($this);

        require('requests').post(
            urls.api.url('reviews'),
            data
        ).done(function(new_review) {

            // Update the ratings listing for the app.
            rewriter(app, function(data) {
                data.objects.unshift(new_review);
                data.meta.total_count += 1;
                if (!data.user) {
                    data.user = {};
                }
                data.user.has_rated = true;
                return data;
            });

            var new_rating = parseInt(data.rating, 10);

            // Update the app model.
            var app_model;
            if (app_model = models('app').lookup(app)) {
                var num_ratings = app_model.ratings.count;
                if (!num_ratings) {
                    app_model.ratings.average = new_rating;
                } else {
                    // Update the app's rating to reflect the new average.
                    app_model.ratings.average = (app_model.ratings.average * num_ratings + new_rating) / (num_ratings + 1);
                }
                app_model.ratings.count += 1;
            }

            // Set the user's review in the request cache.
            cache.set(
                urls.api.params('reviews', {app: app, user: 'mine'}),
                {
                    meta: {limit: 20, next: null, offset: 0, total_count: 1},
                    info: {average: new_rating, slug: app},
                    objects: [new_review]
                }
            );

            notify({message: gettext('Your review was posted')});
            z.page.trigger('navigate', urls.reverse('app', [app]));

            tracking.trackEvent('App view interactions', 'click', 'Successful review');
            tracking.setVar(12, 'Reviewer', 'Reviewer', 1);
            tracking.trackEvent(
                'Write a Review',
                'click',
                app,
                data.rating
            );

        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('Error while submitting review')});
        });
    });

    return {_rewriter: rewriter};

});
