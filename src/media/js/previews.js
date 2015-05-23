/*
    Preview trays which holds previews and screenshots.
    On mobile, only Flipsnap (touch-drag) used to navigate images.
    On desktop form factor, previous/next buttons added to navigate images.
    On desktop detail, we CSS-toggle between a mobile tray and desktop tray
    so it's not true responsive since both trays need different logic.

    Previews contain several components:
        - Bottom scroll bars.
        - Previous/next buttons for desktop.
        - Lightbox modal.

    - We have logic that calculates how many previews are visible in the tray,
      and add scrollbars/buttons only when there is more to see. The previews
      only scrolls as far as it needs.
    - Detail page on desktop is detected by using a media query.
    - Use capabilities.device_type() only to determine whether to add buttons.
*/
define('previews',
    ['core/capabilities', 'core/log', 'core/z', 'flipsnap',
     'previews-buttons', 'previews-lightbox', 'underscore'],
    function(caps, log, z, Flipsnap,
             previewButtons, previewsLightbox, _) {
    var logger = log('previews');

    // Keep track of all sliders on the page to do stuff on resize.
    var sliders = [];

    // Padded size of preview images (in pixels).
    var dimensions = {
        thumb: 160,
        minWidth: 300,
        full: 520,
        breakpoint: 1050,  // Width when desktop trays appear.
        // Technically the left margin of each preview in tray.
        padding: 10,
        paddingFull: 30
    };
    var mediaSwitch = '(min-width:' + dimensions.breakpoint + 'px)';

    var desktopSideMargin = 0;  // Keep track of tray offset.
    var previewItemClass = '.previews-thumbnail';

    function initPreviewTray(e) {
        // Handler to initialize preview trays.
        var tray = this;
        var $tray = $(tray);
        if ($tray.data('previews-initialized')) {
            return;
        }

        var $previewsContent = $tray.find('.previews-content');
        // Set to LTR so we can manually lay it out ourselves.
        var $slider = $tray.find('.previews-slider').attr('dir', 'ltr');
        var numPreviews = $tray.find(previewItemClass).length;
        var isDesktopDetailTray = isDesktopDetailTrayFn(tray);
        if (isDesktopDetailTray) {
            resizeDesktopDetailTray();
        }

        // Create bars.
        var numBars = calcNumBars(tray);
        var $bars = initializeBars(tray);

        // Set the width of the tray.
        var previewWidth = isDesktopDetailTray ?
            (dimensions.full + dimensions.paddingFull) : dimensions.thumb;
        $previewsContent.css({
            width: numPreviews * previewWidth - dimensions.padding + 'px'
        });

        // Mark as initialized.
        resizeDesktopDetailTray();
        $tray.attr('data-previews-initialized', true);

        if (numPreviews > 2) {
            // FlipSnap it.
            var slider = Flipsnap($previewsContent[0], {
                distance: previewWidth
            });
            // TODO: pass in as opts when upgrade Flipsnap.
            slider._maxPoint = numBars > 1 ? numBars - 1 : 0;

            // Store sliders and trays for later use.
            // Keep track of the scroll subtract to use for button states.
            slider.tray = tray;
            slider.numBars = numBars;
            tray.slider = slider;
            sliders.push(slider);

            // Initialize the bar position.
            updatePreviewBar($bars, slider);

            // Add scroll buttons.
            var buttons = previewButtons.attach(slider, $slider);

            if (document.documentElement.getAttribute('dir') === 'rtl') {
                for (var i = 0; i < numBars - 1; i++) {
                    // Start at the end for RTL - simulate clicking "next" numBars times.
                    slider.toNext();
                    $tray.trigger('previews--button-update');
                }
            }
        }
    }

    function initialize() {
        // Main event that initializes preview trays.
        logger.log('Initializing trays');
        $('.previews-expanded .previews-tray').each(initPreviewTray);
    }

    function calcNumBars(tray) {
        // Calculate the limit of how far we should be able to scroll.
        var $tray = $(tray);
        var isDesktopDetailTray = isDesktopDetailTrayFn(tray);
        var isDetailTray = $tray.data('previews-detail');
        var numPreviews = $tray.find(previewItemClass).length;

        // The number of previews full visible is the tray width divided by
        // preview width, floored.
        var trayWidth = Math.max($tray.width(), dimensions.minWidth);
        var previewWidth = isDesktopDetailTray ? dimensions.full :
                                                 dimensions.thumb;
        var numPreviewsFit = Math.floor(
            (trayWidth + dimensions.padding * 2) / previewWidth);

        // The number of bars to show is how many previews are not visible,
        // add one since only 1 bar means no scroll.
        var numBars = numPreviews - numPreviewsFit + 1;
        if (numBars === 1) {
            numBars = 0;
        }
        return numBars;
    }

    function initializeBars(tray) {
        // Create scroll bars at bottom of the tray.
        var numPreviews = tray.querySelectorAll(previewItemClass).length;
        var numBars = calcNumBars(tray);

        var barsContainer = tray.querySelector('.previews-bars');
        for (var i = 0; i < numBars; i++) {
            barsContainer.appendChild(document.createElement('b'));
        }
        return $(barsContainer.querySelectorAll('b'));
    }

    var refreshSliders = _.debounce(function() {
        // Remove bars and buttons from each slider, then recalculate.
        sliders.forEach(function(slider) {
            // Remove bars.
            var tray = slider.tray;
            var trayBars = tray.querySelector('.previews-bars');
            while (trayBars.firstChild) {
                trayBars.removeChild(trayBars.firstChild);
            }
            // Reset slider.
            slider.moveToPoint(0);
            // Reinitialize bars.
            updatePreviewBar(initializeBars(tray), slider);
            slider.numBars = calcNumBars(tray);
            slider._maxPoint = slider.numBars > 1 ? slider.numBars - 1 : 0;
            // Update button states.
            $(tray).trigger('previews--button-update');
        });
    }, 250);

    function updatePreviewBar($bars, slider) {
        // Listener to update the colored scroll bar position.
        function setActiveBar($bars, position) {
            // Only show bars if more than two screenshots.
            $bars.filter('.current').removeClass('current');
            $bars.eq(position).addClass('current');
        }
        slider.element.addEventListener('fsmoveend', function() {
            setActiveBar($bars, slider.currentPoint);
        }, false);
        setActiveBar($bars, slider.currentPoint);
    }

    function resizeDesktopDetailTray() {
        // Fit and realign the preview tray to the window.
        var $tray = $('.previews-tray[data-previews-desktop]');
        if ($tray.length === 0) {
            return;
        }

        $tray.css('width', z.win.width() + 'px');
        var offset = $tray.offset();

        // LTR or RTL?
        if (document.documentElement.getAttribute('dir') === 'rtl') {
            desktopSideMargin += offset.left;
            $tray.css('margin-right', desktopSideMargin + 'px');
        } else {
            desktopSideMargin += -1 * offset.left;
            $tray.css('margin-left', desktopSideMargin + 'px');
        }
    }

    function isDesktopDetail() {
        return $('[data-page-type~="detail"]').length &&
                window.matchMedia(mediaSwitch).matches;
    }

    function isDesktopDetailTrayFn(tray) {
        return tray.getAttribute('data-previews-desktop') &&
               tray.getAttribute('data-previews-detail');
    }

    z.win.on('resize', _.debounce(function() {
        refreshSliders();
        if ($('[data-page-type~="detail"] ' +
              '[data-previews-desktop][data-previews-initialized]').length) {
            resizeDesktopDetailTray();
        } else {
            $('.previews-tray').attr('style', '');
            desktopSideMargin = 0;
        }
    }))

    .on('unloading.tray', function() {
        // We're leaving the page, so destroy Flipsnap.
        sliders.forEach(function(slider) {
            slider.destroy();
        });
        sliders = [];
        desktopSideMargin = 0;
    });

    // Don't treat the trays as draggable (bug 1138396).
    z.page.on('dragstart', '.previews-tray', function(e) {
        e.preventDefault();
    })

    // Open lightbox to this preview unless we're on a Desktop details page
    // or the preview is a Desktop details page video.
    .on('click', '.previews-tray ' + previewItemClass, function(e) {
        var isVideo = e.target.nodeName === 'VIDEO';

        if (!isVideo || !isDesktopDetail() && isVideo) {
            e.preventDefault();

            if (!isDesktopDetail()) {
                previewsLightbox.show(this);
            }
        }
    });

    return {
        initialize: initialize,
        resizeDesktopDetailTray: resizeDesktopDetailTray
    };
});
