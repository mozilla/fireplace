define('previews',
    ['flipsnap', 'templates', 'capabilities', 'shothandles', 'underscore', 'z'],
    function(Flipsnap, nunjucks, caps, handles, _, z) {

    // magic numbers!
    var THUMB_WIDTH = 180;
    var THUMB_PADDED = 195;

    var slider_pool = [];

    function populateTray() {
        // preview trays expect to immediately follow a .mkt-tile.
        var $tray = $(this);
        var $tile = $tray.prev();
        if (!$tile.hasClass('mkt-tile') || $tray.find('.slider').length) {
            return;
        }
        var product = $tile.data('product');
        var previewsHTML = '';
        if (!product || !product.previews) return;
        _.each(product.previews, function(p) {
            p.typeclass = p.filetype === 'video/webm' ? 'video' : 'img';
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

        slider_pool.push(slider);

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

    }

    // Reinitialize Flipsnap positions on resize.
    z.doc.on('saferesize.tray', function() {
        $('.tray').each(function() {
            var $tray = $(this);
            $tray.find('.content').css('margin', '0 ' + ($tray.width() - THUMB_WIDTH) / 2 + 'px');
        });
        for (var i = 0, e; e = slider_pool[i++];) {
            e.refresh();
        }
    });

    // We're leaving the page, so destroy Flipsnap.
    z.win.on('unloading.tray', function() {
        $('.tray').off('click.tray');
        for (var i = 0, e; e = slider_pool[i++];) {
            e.destroy();
        }
        slider_pool = [];
    });

    z.page.on('dragstart dragover', function(e) {
        e.preventDefault();
    }).on('loaded populatetray', function() {
        $('.listing.expanded .mkt-tile + .tray:empty').each(populateTray);
    });
});
