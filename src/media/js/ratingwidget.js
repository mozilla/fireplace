define('ratingwidget', ['core/format', 'jquery'], function(format, $) {
    // Replaces rating select boxes with a rating widget.
    $.fn.ratingwidget = function(classes) {
        this.each(function(n, el) {
            if (!classes) {
                classes = '';
            }
            var $el = $(el);
            var allClasses = 'ratingwidget stars stars-0 ' + classes;
            var $widget = $('<span class="' + allClasses + '"></span>');

            function showStars(n) {
                $widget.removeClass('stars-0 stars-1 stars-2 stars-3 stars-4 stars-5')
                       .addClass('stars-' + n);
            }

            function setStars(n) {
                if (rating == n) {
                    return;
                }
                var e = $widget.find(format.format('[value="{0}"]', n));
                e.trigger('click');
                showStars(n);
                rating = n;
            }

            var rating;
            if ($('option[selected]', $el).length) {
                // Existing rating found. Initialize the widget.
                var temp_rating = $el.val();
                setStars(temp_rating);
                rating = parseInt(temp_rating, 10);
            }

            var stars_html = '';
            for (var i = 1; i <= 5; i++) {
                var checked = rating === i ? ' checked' : '';
                // L10n: {n} is the number of stars
                stars_html += format.format(
                    '<label data-stars="{0}">' +
                      '{1}' +
                      '<input required type="radio" name="rating"{2} value="{3}">' +
                    '</label>',
                    [i, ngettext('{n} star', '{n} stars', {n: i}), checked, i]);
            }
            $widget.html(stars_html);
            $el.before($widget).detach();

            $widget.on('click', function(e) {
                var target = $(e.target);
                if (target.is('input[type=radio]')) {
                    showStars(rating = target.attr('value'));
                    if (!target.val()) {
                        // If user cause a radio btn to uncheck, recheck b/c
                        // that shouldn't happen.
                        target.attr('checked', true);
                    }
                }
            })
            .on('mouseover', function(e) {
                var target = e.target;
                var stars = target.getAttribute('data-stars');
                if (stars) {
                    showStars(stars);
                }
            })
            .on('mouseout', function(evt) {
                showStars(rating || 0);
            })
            .on('touchmove', function(e) {
                var w = $widget.width();
                var widget = $widget[0];
                var left = widget.getBoundingClientRect().left +
                           window.pageXOffset - document.body.clientLeft;
                var r = (e.originalEvent.touches[0].clientX - left) / w * 5 + 1;
                r = Math.min(Math.max(r, 1), 5) | 0;
                setStars(r);
            })
            .on('touchstart', 'label', function (e) {
                setStars(e.currentTarget.getAttribute('data-stars'));
            });
        });

        return this;
    };
});
