/*
    Previews and screenshots modal, triggered on click of a preview
    within a preview tray on an app detail page.
*/
define('previews-lightbox',
    ['core/log', 'core/models', 'core/navigation', 'core/utils', 'core/z',
     'keys', 'previews-buttons', 'tracking', 'underscore'],
    function(log, models, navigation, utils, z,
             keys, previewButtons, tracking, _) {
    var logger = log('previews-lightbox');

    var $lightbox = $(document.getElementById('lightbox'));
    var $section = $lightbox.find('section');
    var $content = $lightbox.find('.content');
    var currentApp;
    var previews;
    var slider;

    $lightbox.addClass('shots previews-slider');
    $lightbox.attr('dir', 'ltr');

    function show(clickedPreview) {
        logger.log('Opening lightbox');
        z.body.trigger('lightbox-open');

        var $preview = $(clickedPreview);
        var position = $preview.closest('li').index();
        var $tray = $preview.closest('.previews-tray');
        var $tile = $tray.siblings('.mkt-tile');

        if (!$tile.length) {
            logger.log('[WARN] could not find .mkt-tile near .previews.');
            return;
        }

        var product = models('app').lookup($tile.data('slug'));
        var id = product.id;

        if (id != currentApp || !slider) {
            currentApp = id;
            previews = product.previews;
            renderPreviews();
        }

        navigation.modal('lightbox');

        // Fade that bad boy in.
        z.body.addClass('overlayed');
        $lightbox.show();
        setTimeout(function() {
            slider.moveToPoint(position);
            resize();
            $lightbox.addClass('show');
        }, 0);
    }

    // Set up key bindings.
    z.win.on('keydown.lightboxDismiss', function(e) {
        switch (e.which) {
            case keys.ESCAPE:
                if ($lightbox.hasClass('show')) {
                    e.preventDefault();
                    hideLightbox();
                }
                break;
            case keys.LEFT:
                if (slider) {
                    e.preventDefault();
                    slider.toPrev();
                }
                break;
            case keys.RIGHT:
                if (slider) {
                    e.preventDefault();
                    slider.toNext();
                }
                break;
        }
    });

    function renderPreviews() {
        // Clear out the existing content.
        $content.empty();

        // Place in a pane for each image/video with a 'loading' placeholder.
        _.each(previews, function(p) {
            var $el = $('<li class="loading"><span class="throbber">');
            $content.append($el);

            // Let's fail elegantly when our images don't load.
            // Videos on the other hand will always be injected.
            if (p.filetype == 'video/webm') {
                // TODO: Check for `HTMLMediaElement.NETWORK_NO_SOURCE` on
                // vid's `networkState` property.
                var v = $('<video src="' + p.image_url + '" controls></video>');
                $el.removeClass('loading');
                $el.append(v);
            } else {
                var i = new Image();

                i.onload = function() {
                    $el.removeClass('loading');
                    $el.append(i);
                };
                i.onerror = function() {
                    $el.removeClass('loading');
                    $el.append('<b class="err">&#x26A0;</b>');
                };

                // Attempt to load the image.
                i.src = p.image_url;
            }
        });

        // $section doesn't have its proper width until after a paint.
        if ($content.length) {
            slider = Flipsnap($content[0]);
            slider.element.addEventListener('fsmoveend', pauseVideos, false);
            previewButtons.attach(slider, $section, {
                isLightbox: true
            });
        }
    }

    function resize() {
        if (!slider) {
            return;
        }
        slider.distance = $section.width();
        slider.refresh();
    }

    function pauseVideos() {
        $('video').each(function() {
            this.pause();
        });
    }

    function hideLightbox() {
        navigation.closeModal('lightbox');
        close();
    }

    function close() {
        z.body.removeClass('overlayed');
        pauseVideos();
        $lightbox.removeClass('show');
        setTimeout(function() {
            // Can't trust transitionend to fire in all cases.
            $lightbox.hide();
        }, 500);
        if (slider && slider.element) {
            slider.element.removeEventListener('fsmoveend', pauseVideos);
            slider.destroy();
            slider = null;
        }
    }

    // We need to adjust the scroll distances on resize.
    z.win.on('resize', _.debounce(resize, 200));

    // Dismiss the lighbox when we click outside it or on the close button.
    $lightbox.on('click', function(e) {
        if ($(e.target).is('#lightbox li')) {
            hideLightbox();
            e.preventDefault();
        }
    })
    .on('dragstart', function(e) {
        e.preventDefault();
    })
    .find('.close')
    .on('click', utils._pd(hideLightbox));

    z.win.on('closeModal', function (e, modalName) {
        if (modalName === 'lightbox') {
            close();
        }
    });

    return {
        close: close,
        show: show
    };
});
