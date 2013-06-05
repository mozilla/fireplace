define('ratings',
    ['cache', 'capabilities', 'forms', 'helpers', 'l10n', 'login', 'settings', 'templates', 'tracking', 'underscore', 'utils', 'urls', 'user', 'z', 'requests', 'notification', 'common/ratingwidget'],
    function(cache, capabilities, forms, helpers, l10n, login, settings, nunjucks, tracking, _, utils, urls, user, z) {
    'use strict';

    var gettext = l10n.gettext;
    var notify = require('notification').notification;

    function rewriter(app, rewriter) {
        var unsigned_url = urls.api.unsigned.url('reviews');
        cache.attemptRewrite(
            function(key) {
                if (utils.baseurl(key) !== unsigned_url) {
                    return;
                }
                var kwargs = utils.querystring(key);
                if ('app' in kwargs && kwargs.app === app) {
                    return true;
                }
            },
            rewriter
        );
    }

    function flagReview($reviewEl) {
        var $modal = $('.report-spam');

        if (!$modal.length) {
            z.page.append(
                nunjucks.env.getTemplate('ratings/report.html').render(helpers)
            );
            $modal = $('.report-spam');
        }

        $modal.one('click', '.menu a', utils._pd(function(e) {
            var $actionEl = $reviewEl.find('.actions .flag');
            $('.cloak').trigger('dismiss');
            $actionEl.text(gettext('Sending report...'));
            require('requests').post(
                require('settings').api_url + urls.api.sign($reviewEl.data('report-uri')),
                {flag: $(e.target).attr('href').replace('#', '')}
            ).done(function() {
                notify({message: gettext('Review flagged')});
                $actionEl.remove();
            }).fail(function() {
                notify({message: gettext('Report review operation failed')});
            });
        }));

        z.body.trigger('decloak');
        $modal.addClass('show');
    }

    function deleteReview(reviewEl, uri, app) {
        reviewEl.addClass('deleting');
        require('requests').del(settings.api_url + urls.api.sign(uri)).done(function() {
            notify({message: gettext('Your review was deleted')});

            rewriter(app, function(data) {
                data.objects = data.objects.filter(function(obj) {
                    return obj.resource_uri !== uri;
                });
                data.meta.total_count -= 1;
                data.user.has_rated = false;
                return data;
            });
            require('views').reload();

        }).fail(function() {
            notify({message: gettext('There was a problem deleting the review')});
        });
    }

    function loginToRate() {
        login.login();
        // Set a flag to know that we expect the modal to open
        // this prevents opening later if login was cancelled
        // as this flag is cleared in that case.
        z.flags.open_rating = true;
        z.page.one('loaded', function(){
            if (z.flags.open_rating){
                z.flags.open_rating = false;
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
            if  (this.id === 'edit-review') {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            var $ratingModal = $('.compose-review.modal');
            if (!$ratingModal.length) {
                var ctx = _.extend({slug: $this.data('app')}, helpers);
                z.page.append(
                    nunjucks.env.getTemplate('ratings/write.html').render(ctx)
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
        }
    })).on('click', '.write-review', addReview)
    .on('loaded', function() {
        // Hijack <select> with stars.
        $('select[name="rating"]').ratingwidget();
        utils.initCharCount();
    }).on('login_cancel login_fail', function() {
        // Clear flag for open rating modal on cancel/fail of login.
        z.flags.open_rating = false;
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

            rewriter(app, function(data) {
                data.objects.unshift(new_review);
                data.meta.total_count += 1;
                data.user.has_rated = true;
                return data;
            });

            notify({message: gettext('Your review was posted')});
            z.page.trigger('navigate', urls.reverse('app', [$this.data('app')]));

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
