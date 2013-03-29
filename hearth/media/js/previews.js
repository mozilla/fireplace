define('previews', ['flipsnap', 'templates', 'utils', 'capabilities', 'shothandles', 'z'],
       function(Flipsnap, nunjucks, utils, caps, handles, z) {
    function init() {
        // magic numbers!
        var THUMB_WIDTH = 180;
        var THUMB_PADDED = 195;

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
            var $content = $tray.find('.content');

            var width = numPreviews * THUMB_PADDED - 15;

            $content.css({
                width: width + 'px',
                margin: '0 ' + ($tray.width() - THUMB_WIDTH) / 2 + 'px'
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
            $tray.on('click.tray', '.dot', function() {
                slider.moveToPoint($(this).index());
            });

            // Tray can fit 3 desktop thumbs before paging is required.
            if (numPreviews > 3 && caps.widescreen) {
                handles.attachHandles(slider, $tray.find('.slider'));
            }

            // Reinitialize Flipsnap positions on resize.
            z.doc.on('saferesize.tray', function() {
                if (slider) {
                    $tray.find('.content').css('margin', '0 ' + ($tray.width() - THUMB_WIDTH) / 2 + 'px');
                    slider.refresh();
                }
            });

            // We're leaving the page, so destroy Flipsnap.
            z.win.on('unloading.tray', function() {
                if (slider) {
                    slider.destroy();
                }
            });
        }

        z.page.on('dragstart', utils._pd);

        // Remove our event listeners because we good like dat.
        // BTW, this is how we should always do things.
        z.win.on('unloading', function() {
            $('.tray').off('click.tray');
            z.doc.off('saferesize.tray');
            z.doc.off('unloading.tray');
        });

        z.page.on('loaded populatetray', function() {
            $('.listing.expanded .mkt-tile + .tray:empty').each(populateTray);
        });
    }

    return {init: init};
});
