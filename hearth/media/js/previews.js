define('previews', ['z'], function(z) {
    function init() {
        // magic numbers!
        var THUMB_WIDTH = 180;
        var THUMB_PADDED = 195;

        z.page.on('dragstart', _pd);

        function populateTray() {
            // preview trays expect to immediately follow a .mkt-tile.
            var $tray = $(this);
            var $tile = $tray.prev();
            if (!$tile.hasClass('mkt-tile') || $tray.find('.slider').length) {
                return;
            }
            var product = $tile.data('product');
            var previewsHTML = '';
             if (!product.previews) return;
            _.each(product.previews, function(p) {
                p.typeclass = p.type === 'video/webm' ? 'video' : 'img';
                previewsHTML += nunjucks.env.getTemplate('detail/single_preview.html').render(p);
            });

            var dotHTML = '';
            if (product.previews.length > 1) {
                dotHTML = Array(product.previews.length + 1).join('<b class="dot"></b>');
            }
            $tray.html(nunjucks.env.getTemplate('detail/preview_tray.html').render({
                previews: previewsHTML,
                dots: dotHTML
            }));

            var numPreviews = $tray.find('li').length;

            var width = numPreviews * THUMB_PADDED - 15;

            $tray.find('.content').css({
                'width': width + 'px',
                'margin': '0 ' + ($tray.width() - THUMB_WIDTH) / 2 + 'px'
            });

            var slider = Flipsnap($tray.find('.content')[0], {distance: 195});
            var $pointer = $tray.find('.dots .dot');

            slider.element.addEventListener('fsmoveend', setActiveDot, false);

            // Show as many thumbs as possible to start. Using MATH!
            slider.moveToPoint(~~($tray.width() / THUMB_PADDED / 2));

            function setActiveDot() {
                $pointer.filter('.current').removeClass('current');
                $pointer.eq(slider.currentPoint).addClass('current');
            }
            $tray.on('click', '.dot', function() {
                slider.moveToPoint($(this).index());
            });
        }

        z.page.on('loaded populatetray', function() {
            var trays = $('.listing.expanded .mkt-tile + .tray');
            trays.each(populateTray);
        });
    }

    return {init: init};
});
