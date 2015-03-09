define('reviews',
    ['compat_filter', 'core/cache', 'core/capabilities',
     'core/forms', 'jquery', 'core/l10n', 'core/login', 'core/models',
     'core/notification', 'core/nunjucks', 'ratingwidget', 'core/requests', 'core/settings',
     'underscore', 'core/utils', 'core/urls', 'core/user', 'core/z'],
    function(compat, cache, caps,
             forms, $, l10n, login, models,
             notification, nunjucks, ratingwidget, requests, settings,
             _, utils, urls, user, z) {
    var gettext = l10n.gettext;
    var notify = notification.notification;

    function rewriter(app, processor) {
        var base_url = urls.api.base.url('reviews');
        cache.attemptRewrite(function(key) {
            if (utils.baseurl(key) !== base_url) {
                return;
            }
            var kwargs = utils.querystring(key);
            if ('app' in kwargs && kwargs.app === app) {
                return true;
            }
        }, processor);
    }

    function flagReview($review) {
        z.page.append(nunjucks.env.render('_includes/flag_review_modal.html'));
        $modal = $('mkt-prompt[data-modal="flag-review"]');

        $modal.one('click', '.reasons a', utils._pd(function(e) {
            var $actionEl = $review.find('.review-actions .review-flag');
            $modal[0].dismissModal();

            // L10n: The report is an abuse report for reviews.
            $actionEl.text(gettext('Flagging review...'));

            var endpoint = settings.api_url + urls.api.sign($review.data('report-uri'));
            requests.post(endpoint, {flag: $(e.target).data('reason')}).done(function() {
                $review.attr('data-review-has-flagged', true);
                notify({message: gettext('This review has been successfully flagged. Thanks!')});

                // Cache-bust so the report link doesn't show up in session.
                var reviewsEndpoint = urls.api.params('reviews', {
                    app: $('[data-slug]').data('slug')
                });
                var index = $('.review').index($review);
                var appReviewsCache = cache.get(reviewsEndpoint);
                appReviewsCache.objects[index].has_flagged = true;
                cache.set(reviewsEndpoint, appReviewsCache);
            }).fail(function() {
                notify({message: gettext('Sorry, there was an issue flagging the review. Please try again later.')});
            });
        }));
    }

    function deleteReview(reviewEl, uri, app) {
        reviewEl.addClass('deleting');
        requests.del(settings.api_url + urls.api.sign(uri)).done(function() {
            notify({message: gettext('This review has been successfully deleted')});
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
            var app_model = models('app').lookup(app);
            if (app_model) {
                app_model.ratings.count -= 1;
                if (!app_model.ratings.count) {
                    app_model.ratings.average = 0;
                }
                // We cheat and don't update the average.
            }

            // Clear the user's review from the request cache.
            cache.bust(urls.api.params('reviews', {app: app, user: 'mine'}));

            // Change Edit to Write button.
            $('.review-buttons [data-edit-review]').removeAttr('data-edit-review')
                                                   .text(gettext('Write a Review'));
        }).fail(function() {
            notify({message: gettext('Sorry, there was a problem deleting the review')});
        });
    }

    function loginToRate() {
        // Prompt user to login, then open up review forms on post-login.
        function onLoginSuccess() {
            if (!z.body.hasClass('logged-in')) {
                // Login window was cancelled.
                return;
            }

            var reviewButton = document.querySelector('.review-buttons .review-button');
            if (!reviewButton) {
                // Can't review paid app without purchasing.
                return;
            }
            if (caps.widescreen()) {
                addReview.apply(reviewButton);
            } else {
                z.page.trigger('navigate', reviewButton.getAttribute('href'));
            }
        }

        login.login();
        z.page.one('loaded', onLoginSuccess);
        return;
    }

    function addReview(e) {
        if (!user.logged_in()) {
            // If not logged in, prompt to do so. Review form will be handled
            // on post-login.
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            return loginToRate();
        }

        if (caps.widescreen()) {
            if (e) {
                // Navigate to the page (for edit or add) on mobile.
                e.preventDefault();
                e.stopPropagation();
            }

            // Add review modal (for edit or add) for desktop.
            if (this.hasAttribute('data-edit-review')) {
                // Either get the direct URI (for admins) or use `mine`.
                var endpoint = this.getAttribute('data-href');
                if (endpoint) {
                    endpoint = urls.api.host(endpoint) + endpoint;
                } else {
                    endpoint = urls.api.params('reviews', {
                        app: $('[data-app]').data('app'),
                        user: 'mine'
                    });
                }
                this.innerHTML = gettext('Loading...');

                var self = this;
                requests.get(endpoint).done(function(existingReview) {
                    if (existingReview.objects) {
                        // In case we used slug + mine.
                        existingReview = existingReview.objects[0];
                    }
                    initReviewModal(existingReview);
                    self.innerHTML = self.getAttribute('data-text');
                });
            } else {
                initReviewModal();
            }
        }
    }

    function initReviewModal(existingReview) {
        if (!$('mkt-prompt[data-modal="review"]').length) {
            z.body.append(
                nunjucks.env.render('_includes/review_modal.html', {
                    existingReview: existingReview,
                    slug: $('[data-app]').data('app')
                })
            );
            $('mkt-prompt[data-modal="review"]').find('select[name="rating"]')
                                                .ratingwidget('large');
            utils.initCharCount();
        }
    }

    z.page.on('click', '.review-actions a', utils._pd(function(e) {
        var $this = $(this);
        var action = $this.data('action');
        if (!action) {
            return;
        }
        var $review = $this.closest('.review');

        switch (action) {
            case 'delete':
                deleteReview($review, $this.data('href'), $this.data('app'));
                break;
            case 'report':
                flagReview($review);
                break;
            default:
                return;
        }
        e.stopPropagation();  // Don't fire if action was matched.
    }))

    .on('click', '.review-button', addReview)

    .on('loaded', function() {
        // Hijack <select> with stars.
        $('select[name="rating"]').ratingwidget();
        utils.initCharCount();
    });

    z.doc.on('submit', '.add-review-form', utils._pd(function(e) {
        // Used for both the add review page and modal.
        var $this = $(this);
        var data = utils.getVars($this.serialize());
        var slug = data.app;
        forms.toggleSubmitFormState($this);

        requests.post(urls.api.url('reviews'), data).done(function(new_review) {
            // Update the ratings listing for the app.
            rewriter(slug, function(data) {
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
            var app_model = models('app').lookup(slug);
            if (app_model) {
                var num_ratings = app_model.ratings.count;
                if (!num_ratings) {
                    app_model.ratings.average = new_rating;
                } else {
                    // Update the app's rating to reflect the new average.
                    app_model.ratings.average =
                        (app_model.ratings.average * num_ratings + new_rating) /
                        (num_ratings + 1);
                }
                app_model.ratings.count += 1;
            }

            // Set the user's review in the request cache.
            cache.set(urls.api.params('reviews', {app: slug, user: 'mine'}), {
                meta: {limit: 20, next: null, offset: 0, total_count: 1},
                info: {average: new_rating, slug: slug},
                objects: [new_review]
            });

            notify({message: gettext('Your review was successfully posted. Thanks!')});
            z.page.trigger('navigate', urls.reverse('app', [slug]));
        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('Sorry, there was an error posting your review. Please try again later.')});
        });
    }));

    z.doc.on('submit', '.edit-review-form', utils._pd(function(e) {
        var $this = $(this);
        var resource_uri = $this.data('uri');
        var uri = settings.api_url + urls.api.sign(resource_uri);
        var data = utils.getVars($this.serialize());
        var slug = data.app;
        forms.toggleSubmitFormState($this);

        requests.put(uri, data).done(function(editedReview) {
            // Rewrite cache with edited review.
            cache.set(settings.api_url + editedReview.resource_uri, editedReview);

            rewriter(slug, function(reviews) {
                reviews.objects.forEach(function(obj, i) {
                    if (reviews.objects[i].resource_uri === resource_uri) {
                        reviews.objects[i].body = data.body;
                        reviews.objects[i].rating = data.rating;
                    }
                });
                return reviews;
            });

            notify({message: gettext('Your review was successfully edited')});
            z.page.trigger('navigate', urls.reverse('app', [slug]));
        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('Sorry, there was an issue editing your review. Please try again later')});
        });
    }));

    return {
        _rewriter: rewriter
    };
});
