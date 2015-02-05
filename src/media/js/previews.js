/*
    Preview trays which holds previews and screenshots.
    On mobile, uses Flipsnap which enables touch-drag.
    On desktop, adds prev/next buttons to navigate images.
*/
define('previews',
    ['flipsnap', 'log', 'models', 'templates', 'capabilities', 'shothandles',
     'underscore', 'z'],
    function(Flipsnap, log, models, nunjucks, caps, handles,
             _, z) {
    var logger = log('previews');

    // Magic numbers!
    var THUMB_WIDTH = 150;
    var THUMB_PADDED = 165;
    var DESKTOP_WIDTH = 540;
    var DESKTOP_PADDED = 550;

    var slider_pool = [];

    function adjustWidth() {
        // Full width of window on desktop.
        // Width of page on mobile.
        var $previews = $('.previews');
        if (window.matchMedia('(min-width:1070px)').matches &&
            $previews.closest('.detail').length) {
            var winWidth = z.win.width();
            $previews.css('width', winWidth + 'px');
            $previews.css('right', (winWidth - 1070) / 2 + 'px');
        } else {
            $previews.attr('style', '');
        }
    }

    function populateTray() {
        var $tray = $(this);
        var numPreviews = $tray.find('li').length;
        var $content = $tray.find('.content');
        var slider = {};

        // Init desktop detail screenshot tray.
        if (caps.device_type() === 'desktop' &&
            $('[data-page-type~="detail"]').length &&
            window.matchMedia('(min-width:1070px)').matches) {

            if ($tray.find('.desktop-content').length) {
                return;
            }

            var $desktopShots = $('<ul class="desktop-content">');

            $tray.find('.content li').each(function(i, elm) {
                var imageSrc = elm.querySelector('a').href;
                var $newShot = $(elm).clone();
                $newShot.find('img').removeClass('deferred').attr('src', imageSrc);
                $desktopShots.append($newShot);
            });

            adjustWidth();
            $tray.find('.slider').append($desktopShots);

            if ($tray.hasClass('single')) {
                $tray.addClass('init');
                return;
            } else {
                $desktopShots.css({
                    width: numPreviews * DESKTOP_PADDED - 10 + 'px',
                    margin: '0 ' + ($tray.width() - DESKTOP_WIDTH) / 2 + 'px'
                });
            }

            slider = Flipsnap(
                $tray.find('.desktop-content')[0],
                {distance: DESKTOP_PADDED}
            );
            this.slider = slider;
            var $pointer = $tray.find('.bars .bar');

            slider.element.addEventListener('fsmoveend', setActiveBar, false);

            // Show as many thumbs as possible to start (zero-indexed).
            slider.moveToPoint(~~($tray.width() / DESKTOP_PADDED / 2));

            slider_pool.push(slider);
        } else {
            $content.css({
                width: numPreviews * THUMB_PADDED - 15 + 'px',
                margin: '0 ' + ($tray.width() - THUMB_WIDTH) / 2 + 'px'
            });

            $tray.addClass('init');

            if ($tray.hasClass('single')) {
                return;
            }

            slider = Flipsnap(
                $tray.find('.content')[0],
                {distance: THUMB_PADDED}
            );
            this.slider = slider;
            var $pointer = $tray.find('.bars .bar');

            slider.element.addEventListener('fsmoveend', setActiveBar, false);

            // Show as many thumbs as possible to start (zero-indexed).
            slider.moveToPoint(~~($tray.width() / THUMB_PADDED / 2) - 1);

            slider_pool.push(slider);
        }

        function setActiveBar() {
            $pointer.filter('.current').removeClass('current');
            $pointer.eq(slider.currentPoint).addClass('current');
        }
        setActiveBar();

        if (caps.device_type() === 'desktop' && numPreviews > 1) {
            handles.attachHandles(slider, $tray.find('.slider'));
        }
    }

    // Reinitialize Flipsnap positions on resize.
    z.doc.on('saferesize.tray', function() {
        $('.tray:not(.single)').each(function() {
            var $tray = $(this);
            $tray.find('.content').css('margin', '0 ' + ($tray.width() - THUMB_WIDTH) / 2 + 'px');
        });
        for (var i = 0, e; e = slider_pool[i++];) {
            e.refresh();
        }
        z.page.trigger('populatetray');
        adjustWidth();
    });

    // We're leaving the page, so destroy Flipsnap.
    z.win.on('unloading.tray', function() {
        for (var i = 0, e; e = slider_pool[i++];) {
            e.destroy();
        }
        slider_pool = [];
    });

    z.page.on('dragstart dragover', function(e) {
        e.preventDefault();
    }).on('populatetray', function() {
        logger.log('Populating trays');
        $('.expanded .tray').each(populateTray);
    });

});
