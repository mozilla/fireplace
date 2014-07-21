define('lightbox',
    ['flipsnap', 'keys', 'models', 'navigation', 'utils', 'shothandles', 'tracking', 'underscore', 'z'],
    function(Flipsnap, keys, models, navigation, utils, handles, tracking, _, z) {

    var $lightbox = $(document.getElementById('lightbox'));
    var $section = $lightbox.find('section');
    var $content = $lightbox.find('.content');
    var currentApp;
    var previews;
    var slider;

    $lightbox.addClass('shots');

    function showLightbox() {
        console.log('Opening lightbox');

        if (z.context.type === 'leaf') {
            tracking.trackEvent('App view interactions', 'click', 'Screenshot view');
        } else if (z.context.type === 'search') {
            tracking.trackEvent(
                'Category view interactions',
                'click',
                'Screenshot view'
            );
        }

        var $this = $(this);
        var which = $this.closest('li').index();
        var $tray = $this.closest('.tray');
        var $tile = $tray.prev();

        // We get the screenshots from the associated tile. No tile? bail.
        if (!$tile.hasClass('mkt-tile')) return;

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
            slider.moveToPoint(which);
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
                // We can check for `HTMLMediaElement.NETWORK_NO_SOURCE` on the
                // video's `networkState` property at some point.
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
            handles.attachHandles(slider, $section);
        }
    }

    function resize() {
        if (!slider) return;
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
        closeLightbox();
    }

    function closeLightbox() {
        z.body.removeClass('overlayed');
        pauseVideos();
        $lightbox.removeClass('show');
        // We can't trust transitionend to fire in all cases.
        setTimeout(function() {
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

    // If a tray thumbnail is clicked, load up our lightbox.
    z.page.on('click', '.tray ul a', utils._pd(showLightbox));

    // Dismiss the lighbox when we click outside it or on the close button.
    $lightbox.on('click', function(e) {
        if ($(e.target).is('#lightbox')) {
            hideLightbox();
            e.preventDefault();
        }
    }).on('dragstart', function(e) {
        e.preventDefault();
    });
    $lightbox.find('.close').on('click', utils._pd(hideLightbox));

    z.win.on('closeModal', function (e, modalName) {
        if (modalName === 'lightbox') {
            closeLightbox();
        }
    });

});
