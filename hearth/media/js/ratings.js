define('ratings',
    ['cache', 'capabilities', 'l10n', 'login', 'templates', 'underscore', 'utils', 'urls', 'user', 'z', 'requests', 'notification', 'common/ratingwidget'],
    function(cache, capabilities, l10n, login, nunjucks, _, utils, urls, user, z) {
    'use strict';

    var gettext = l10n.gettext;
    var notify = require('notification').notification;
    var forms = require('forms');

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
        var $modal = $('.report-spam');

        if (!$modal.length) {
            z.page.append(
                nunjucks.env.getTemplate('ratings/report.html').render(require('helpers'))
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
            require('views').reload();

        }).fail(function() {
            notify({message: gettext('There was a problem deleting the review')});
        });
    }

    function addReview(e, $senderEl) {

        // This is only need on desktop because if we're not showing the
        // modal, instead we go to the add review view.
        if (capabilities.widescreen()) {
            e.stopPropagation();

            // If the user isn't logged in, prompt them to do so.
            if (!user.logged_in()) {
                login.login().done(function() {
                    addReview(e, $senderEl);
                });
                return;
            }

            var ctx = _.extend({slug: $senderEl.data('app')}, require('helpers'));
            z.page.append(
                nunjucks.env.getTemplate('ratings/write.html').render(ctx)
            );
            z.body.trigger('decloak');
            $('.compose-review.modal').addClass('show');
            $('.compose-review').find('select[name="rating"]').ratingwidget('large');
            initCharCount();
        }

    }

    z.page.on('click', '.review .actions a, #add-review', utils._pd(function(e) {
        var $this = $(this);

        var action = $this.data('action');
        if (!action) return;
        var $review = $this.closest('.review');
        switch (action) {
            case 'delete':
                deleteReview($review, $this.data('href'), $this.data('app'));
                break;
            case 'add':
                addReview(e, $this);
                break;
            case 'report':
                flagReview($review);
                break;
        }
    })).on('loaded', function() {
        // Hijack <select> with stars.
        $('select[name="rating"]').ratingwidget();
        initCharCount();
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

        }).fail(function() {
            forms.toggleSubmitFormState($this, true);
            notify({message: gettext('Error while submitting review')});
        });
    });

    return {_rewriter: rewriter};

});
