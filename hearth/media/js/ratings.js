define('ratings',
    ['cache', 'capabilities', 'l10n', 'login', 'templates', 'underscore', 'utils', 'urls', 'user', 'views', 'z', 'requests', 'notification'],
    function(cache, capabilities, l10n, login, nunjucks, _, utils, urls, user, views, z) {
    'use strict';

    var gettext = l10n.gettext;
    var notify = require('notification').notification;

    // Initializes character counters for textareas.
    function initCharCount() {
        var countChars = function(el, cc) {
            var $el = $(el);
            var max = parseInt($el.attr('maxlength'), 10);
            var left = max - $el.val().length;
            // L10n: {n} is the number of characters left.
            cc.html(ngettext('<b>{n}</b> character left.',
                             '<b>{n}</b> characters left.', {n: left}))
              .toggleClass('error', left < 0);
        };
        $('.char-count').each(function() {
            var $cc = $(this);
            $cc.closest('form')
               .find('#' + $cc.data('for'))
               .on('keyup blur', _.throttle(function() {countChars(this, $cc);}, 250))
               .trigger('blur');
        });
    }

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
        var $overlay = utils.makeOrGetOverlay('flag-review');
        $overlay.html(nunjucks.env.getTemplate('ratings/report.html').render(require('helpers')));
        $overlay.addClass('show').trigger('overlayloaded');

        $overlay.one('click', '.cancel', utils._pd(function() {
            $overlay.removeClass('show');
        })).one('click', '.menu a', utils._pd(function(e) {
            var $actionEl = $reviewEl.find('.actions .flag');

            $overlay.removeClass('show');
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
    }

    function deleteReview(reviewEl, uri, app) {
        reviewEl.addClass('deleting');
        require('requests').del(require('settings').api_url + urls.api.sign(uri)).done(function() {
            notify({message: gettext('Your review was deleted')});

            rewriter(app, function(data) {
                data.objects = data.objects.filter(function(obj) {
                    return obj.resource_uri !== uri;
                });
                data.meta.total_count -= 1;
                data.user.has_rated = false;
                return data;
            });
            views.reload();

        }).fail(function() {
            notify({message: gettext('There was a problem deleting the review')});
        });
    }

    function addReview($senderEl) {

        // If the user isn't logged in, prompt them to do so.
        if (!user.logged_in()) {
            login.login().done(function() {
                addReview($senderEl);
            });
            return;
        }

        var overlay = utils.makeOrGetOverlay('edit-review');
        var ctx = _.extend({slug: $senderEl.data('app')}, require('helpers'));
        overlay.html(nunjucks.env.getTemplate('ratings/write-overlay.html').render(ctx));
        overlay.find('select[name="rating"]').ratingwidget('large');

        initCharCount();
        overlay.addClass('show').trigger('overlayloaded');
        overlay.on('click', '.cancel', function(e) {
            e.preventDefault();
            overlay.removeClass('show');
        });
    }

    z.page.on('click', '.review .actions a, #add-review', utils._pd(function(e) {
        var $this = $(this);

        // data('action') only picks up once so we reference attr('data-action') since
        // it changes if a user edits a review
        var action = $this.data('action');
        if (!action) return;
        var $review = $this.closest('.review');
        switch (action) {
            case 'delete':
                deleteReview($review, $this.data('href'), $this.data('app'));
                break;
            case 'add':
                addReview($this);
                break;
            case 'report':
                flagReview($review);
                break;
        }
    })).on('loaded', function() {
        // Hijack <select> with stars.
        $('select[name="rating"]').ratingwidget();

        initCharCount();

        // Show add review modal on app/app_slug/reviews/add for desktop.
        if ($('.reviews.add-review').length) {
            addOrEditYourReview($('#add-first-review'));
        }
    });

    z.body.on('submit', 'form.add-review-form', function(e) {
        e.preventDefault();

        var $this = $(this);
        var app = $this.data('app');

        var data = utils.getVars($this.serialize());
        data.app = app;
        require('requests').post(
            urls.api.url('reviews'),
            data
        ).done(function(new_review) {

            rewriter(app, function(data) {
                data.objects.unshift(new_review);
                if (data.meta.total_count + 1 <= data.meta.limit) {
                    data.meta.total_count += 1;
                }
                data.user.has_rated = true;
                return data;
            });

            notify({message: gettext('Your review was posted')});
            var overlay = $this.closest('.overlay');
            if (overlay.length) {
                overlay.remove();
                views.reload();
            } else {
                z.page.trigger('navigate', urls.reverse('app', [$this.data('app')]));
            }
        }).fail(function() {
            notify({message: gettext('Error while submitting review')});
        });
    });

    return {_rewriter: rewriter};

});
