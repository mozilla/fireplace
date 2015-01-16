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

    function adjustOffset() {
        var trayOffset = 0;
        // If the app shows notices we need to increase the container height.
        // TODO: Clean this up better once we have an idea
        // of whether we're happy with the desktop trays.
        if (window.matchMedia('(min-width:1070px)').matches) {
            if ($('.app-notices').children().length) {
                trayOffset += 90;
            }
            if ($('#installed').css('display') !== 'none') {
                trayOffset += 90;
            }

            $('.app-header.expanded > div')
               .css('height', 830 + trayOffset + 'px')
               .find('.previews')
               .css('top', 225 + trayOffset + 'px');
        } else {
            $('.app-header.expanded > div')
                .css('height', 'inherit')
                .find('.previews')
                .css('top', 0);
        }
    }

    function populateTray() {
        var $tray = $(this);
        var numPreviews = $tray.find('li').length;
        var $content = $tray.find('.content');
        var slider = {};

        // Init desktop detail screenshot tray.
        if (caps.device_type() === 'desktop' &&
            $('[data-page-type~="detail"] .detail').length &&
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

            adjustOffset();
            $tray.find('.slider').append($desktopShots);

            $desktopShots.css({
                width: numPreviews * DESKTOP_PADDED - 10 + 'px',
                margin: '0 ' + ($tray.width() - DESKTOP_WIDTH) / 2 + 'px'
            });

            $tray.addClass('init');

            // Preview tray cloned. We can bail early.
            if ($tray.hasClass('single')) {
                return;
            }

            slider = Flipsnap(
                $tray.find('.desktop-content')[0],
                {distance: DESKTOP_PADDED}
            );
            this.slider = slider;
            var $pointer = $tray.find('.bars .bar');

            slider.element.addEventListener('fsmoveend', setActiveBar, false);

            // Show as many thumbs as possible to start (zero-indexed).
            if (numPreviews === 3) {
                slider.moveToPoint(1);
            } else {
                slider.moveToPoint(~~($tray.width() / DESKTOP_PADDED / 2) - 1);
            }

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
        $('.tray').each(function() {
            var $tray = $(this);
            $tray.find('.content').css('margin', '0 ' + ($tray.width() - THUMB_WIDTH) / 2 + 'px');
        });
        for (var i = 0, e; e = slider_pool[i++];) {
            e.refresh();
        }
        z.page.trigger('populatetray');
        adjustOffset();
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
