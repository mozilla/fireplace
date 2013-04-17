define('ratings',
    ['capabilities', 'l10n', 'login', 'utils', 'urls', 'user', 'views', 'z', 'templates', 'requests', 'notification'],
    function(capabilities, l10n, login, utils, urls, user, views, z, nunjucks) {
    'use strict';

    var gettext = l10n.gettext;
    var notification = require('notification').notification;

    // Initializes character counters for textareas.
    function initCharCount() {
        var countChars = function(el, cc) {
            var $el = $(el),
                val = $el.val(),
                max = parseInt(cc.attr('data-maxlength'), 10),
                left = max - val.length,
                cc_parent = cc.parent();
            // L10n: {n} is the number of characters left.
            cc.html(ngettext('<b>{n}</b> character left.',
                             '<b>{n}</b> characters left.', {n: left}))
              .toggleClass('error', left < 0);
            if (left >= 0 && cc_parent.hasClass('error')) {
                cc_parent.removeClass('error');
            }
        };
        $('.char-count').each(function() {
            var $cc = $(this),
                $form = $(this).closest('form'),
                $el;
            if ($cc.attr('data-for-startswith') !== undefined) {
                $el = $('textarea[id^="' + $cc.attr('data-for-startswith') + '"]:visible', $form);
            } else {
                $el = $('textarea#' + $cc.attr('data-for'), $form);
            }
            $el.bind('keyup blur', _.throttle(function() {
                countChars(this, $cc);
            }, 250)).trigger('blur');
        });
    }

    // Returns the review body text or '' if the supplied element is not found.
    function getBody($body) {
        var body = $body.clone();
        // Get the inner *text* of the review body.
        body.find('br').replaceWith('\n');
        // `.text()` returns the unescaped text content, so re-escape it.
        return utils.escape_(body.text().trim());
    }

    function flagReview($reviewEl) {
        var $overlay = utils.makeOrGetOverlay('flag-review');
        $overlay.html(nunjucks.env.getTemplate('ratings/report.html').render(require('helpers')));
        $overlay.addClass('show').trigger('overlayloaded');

        $overlay.one('click', '.cancel', utils._pd(function() {
            $overlay.removeClass('show');
        })).one('click', '.menu a', utils._pd(function(e) {
            var $actionEl = $reviewEl.find('.actions .flag'),
                reason = $(e.target).attr('href').replace('#', ''),
                oldActionText = $actionEl.text();

            $overlay.removeClass('show');
            $actionEl.text(gettext('Sending report...'));
            require('requests').post(
                require('settings').api_url + urls.api.sign($reviewEl.data('report-uri')),
                {flag: reason}
            ).then(function() {
                $actionEl.replaceWith(gettext('Flagged for review'));
            }).fail(function() {
                require('notification').notification(
                    {message: gettext('Report review operation failed')}
                );
                $actionEl.remove();
            });
        }));
    }

    function deleteReview(reviewEl, action) {
        reviewEl.addClass('deleting');
        require('requests').del(action).done(function() {
            $('#add-first-review').text(gettext('Write a Review'));
            views.reload();
            notification({message: gettext('Your review was successfully deleted!')});
        });
        reviewEl.addClass('deleted');
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
        overlay.html(nunjucks.env.getTemplate('ratings/write-overlay.html').render(require('helpers')));
        overlay.find('select[name="rating"]').ratingwidget('large');

        initCharCount();

        function validate() {
            var $error = overlay.find('.req-error'),
                $comment = overlay.find('textarea'),
                msg = $comment.val().strip(),
                $parent = $comment.closest('.simple-field'),
                $cc = overlay.find('.char-count'),
                valid = !$cc.hasClass('error') && msg;
            if (valid) {
                $parent.removeClass('error');
                $error.remove();
                overlay.off('submit.disable', 'form');
            } else {
                $parent.addClass('error');
                if (!msg && !$error.length) {
                    $(format('<div class="error req-error">{0}</div>',
                             gettext('This field is required.'))).insertBefore($cc);
                }
                overlay.on('submit.disable', 'form', false);
            }
            return valid;
        }

        overlay.addClass('show').trigger('overlayloaded');

        overlay.on('click', '.cancel', function(e) {
            e.preventDefault();
            overlay.removeClass('show');
        }).on('change.comment keyup.comment', 'textarea', _.throttle(validate, 250))
          .on('submit', 'form', function(e) {
            e.preventDefault();
            // Trigger validation.
            if (!validate(e)) {
                return false;
            }

            var data = utils.getVars($(this).serialize());
            data.app = $senderEl.data('app');
            require('requests').post(
                urls.api.url('reviews'),
                data
            ).done(function() {
                overlay.removeClass('show');
                notification({message: gettext('Your review was posted!')});
            }).fail(function() {
                notification({message: gettext('There was a problem submitting your review.')});
            });
        });
    }

    z.page.on('click', '.review .actions a, #add-review', utils._pd(function(e) {
        var $this = $(this);

        // data('action') only picks up once so we reference attr('data-action') since
        // it changes if a user edits a review
        var action = $this.attr('data-action');
        if (!action) return;
        var $review = $this.closest('.review');
        switch (action) {
            case 'delete':
                deleteReview($review, $this.attr('data-href'));
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

});
