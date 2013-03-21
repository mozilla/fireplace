define('ratings',
    ['capabilities', 'utils', 'requests', 'z'],
    function(capabilities, utils, requests, z) {
    // Initializes character counters for textareas.
    function initCharCount() {
        var countChars = function(el, cc) {
            var $el = $(el),
                val = $el.val(),
                max = parseInt(cc.attr('data-maxlength'), 10),
                left = max - val.length,
                cc_parent = cc.parent();
            // L10n: {0} is the number of characters left.
            cc.html(format(ngettext('<b>{0}</b> character left.',
                                    '<b>{0}</b> characters left.', left), [left]))
              .toggleClass('error', left < 0);
            if(left >= 0 && cc_parent.hasClass('error')) {
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

    function init() {
        // Review template.
        //var reviewTemplate = utils.getTemplate($('#review-template'));

        z.page.on('loaded', function() {
            flagOverlay = utils.makeOrGetOverlay('flag-review');

            // Hijack <select> with stars.
            $('select[name="rating"]').ratingwidget();

            // Remove character counter on review field on mobile for now
            // (770661).
            if (!capabilities.mobile) {
                initCharCount();
            }

            // Show add review modal on app/app_slug/reviews/add for desktop.
            if ($('.reviews.add-review').length) {
                addOrEditYourReview($('#add-first-review'));
            }
        });

        // Returns the review body text or '' if the supplied element is not found.
        function getBody($body) {
            var body = $body.clone();
            // Get the inner *text* of the review body.
            body.find('br').replaceWith('\n');
            // `.text()` returns the unescaped text content, so re-escape it.
            return body.text().trim()
                       .replace(/&/g,'&amp;')
                       .replace(/</g,'&lt;')
                       .replace(/>/g,'&gt;');
        }

        function handleReviewOverlay(overlay) {
            var $form = overlay.find('form');

            // Remove character counter on review field on mobile for now
            // (770661).
            if (!capabilities.mobile) {
                initCharCount();
            }

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
                    if (!$parent.hasClass('error')) {
                        $parent.addClass('error');
                    }
                    if (!msg && !$error.length) {
                        $(format('<div class="error req-error">{0}</div>',
                                 gettext('This field is required.'))).insertBefore($cc);
                    }
                    overlay.on('submit.disable', 'form', false);
                }
                return valid;
            }

            overlay.addClass('show');

            overlay.on('submit', 'form', function(e) {
                // Trigger validation.
                if (!validate(e)) {
                    e.preventDefault();
                    return false;
                }
                // Form submission is handled by POST hijacking.
            }).on('click', '.cancel', utils._pd(function() {
                overlay.removeClass('show');
            })).on('change.comment keyup.comment', 'textarea', _.throttle(validate, 250));
        }

        function flagReview(reviewEl) {
            var overlay = utils.makeOrGetOverlay('flag-review');
            overlay.addClass('show');
            overlay.one('click', '.cancel', utils._pd(function() {
                overlay.removeClass('show');
            })).one('click', '.menu a', utils._pd(function(e) {
                var flag = $(e.target).attr('href').slice(1),
                    actionEl = reviewEl.find('.actions .flag');
                overlay.removeClass('show');
                actionEl.text(gettext('Sending report...'));
                $.ajax({
                    type: 'POST',
                    url: reviewEl.data('flag-url'),
                    data: {flag: flag},
                    success: function() {
                        actionEl.replaceWith(gettext('Flagged for review'));
                    },
                    error: function(){ },
                    dataType: 'json'
                });
            }));
        }

        function deleteReview(reviewEl, action) {
            reviewEl.addClass('deleting');
            requests.post(action, {});
            setTimeout(function() {
                reviewEl.addClass('deleted');
                // Change edit review button to submit review button.
                $('#add-edit-review').text(gettext('Write a Review'));
                $('#add-review').children().text(gettext('Write a Review'));
                $('.notification.box').remove();

                // If already existing Django message, replace message.
                var success = $('.success h2');
                if (success.length) {
                    success.text(gettext('Your review was successfully deleted!'));
                } else {
                    $('#page').prepend($('<section class="full notification-box">' +
                        '<div class="success"><h2>' +
                        gettext('Your review was successfully deleted!') +
                        '</h2></div></section>'));
                }
            }, 500);
        }

        // Edit review on the review listing page.
        function editReview(reviewEl) {
            var overlay = utils.makeOrGetOverlay('edit-review'),
                rating = reviewEl.data('rating'),
                action = reviewEl.closest('[data-edit-url]').data('edit-url'),
                body = getBody(reviewEl.find('.body'));
            overlay.html(reviewTemplate({title: gettext('Edit Review'),
                                         action: action, body: body}));
            
            if (z.body.hasClass('desktop')) {
                overlay.find('select[name="rating"]').ratingwidget('large');
            } else {
                overlay.find('select[name="rating"]').ratingwidget();
            }
            overlay.find(format('.ratingwidget [value="{0}"]', rating)).click();

            handleReviewOverlay(overlay);
        }

        // This gets used when you're not editing a review on the review list page.
        function addOrEditYourReview($senderEl) {
            var overlay = utils.makeOrGetOverlay('edit-review'),
                rating = $senderEl.data('rating'),
                title = gettext('Write a Review'),
                body = getBody($('#current-review')),
                action = $senderEl.data('href');

            if (rating > 0) {
                title = gettext('Edit Your Review');
            }

            overlay.html(reviewTemplate({title: title, action: action,
                                         body: body}));

            overlay.find('select[name="rating"]').ratingwidget('large');
            overlay.find(format('.ratingwidget [value="{0}"]', rating)).click();
            handleReviewOverlay(overlay);
        }

        // Toggle rating breakdown (on listing page only, not detail page).
        z.page.on('click', '.average-rating-listing', utils._pd(function() {
            $('.grouped-ratings').toggle();
        })).on('click', '.grouped-ratings-listing', utils._pd(function() {
            $('.grouped-ratings').hide();
        }));

        // Cancel rating button.
        z.page.on('click', '.review .actions a, #add-first-review[data-href]', utils._pd(function(e) {
            var $this = $(this),
                action = $this.data('action');
            if (!action) return;
            var $review = $this.closest('.review');
            switch (action) {
                case 'delete':
                    deleteReview($review, $this.attr('href'));
                    break;
                case 'edit':
                    editReview($review);
                    break;
                case 'add-or-edit':
                    addOrEditYourReview($this);
                    break;
                case 'report':
                    flagReview($review);
                    break;
            }
        }));
    }

    return {init: init};
});
