define('image-deferrer', ['underscore', 'urls', 'z'], function(_, urls, z) {
    'use strict';
    /*
       <img class="deferred" data-src="{{ image.src }}" src="{{ placeholderSrc }}">
       imageDeferrer = require('image-deferrer').ImageDeferrer(null, 200);
       imageDeferrer.setImages($('img.deferred.defer-us'));
    */
    var PLACEHOLDER_SRC = urls.media('fireplace/img/pretty/rocket.png');
    new Image().src = PLACEHOLDER_SRC;  // Preload placeholder image.


    function getXYPos(elem) {
        /*
            Return X/Y position of an element within the page (recursive).
        */
        if (!elem) {
            return {
                x: 0,
                y: 0
            };
        }
        var xy = {
            x: elem.offsetLeft,
            y: elem.offsetTop
        };
        var par = getXYPos(elem.offsetParent);
        for (var key in par) {
            xy[key] += par[key];
        }
        return xy;
    }

    function getScrollOffsets(w) {
        /*
           Return the current scrollbar offsets as the x and y properties of
           an object
        */
        w = w || window;

        // This works for all browsers except IE versions 8 and before
        if (w.pageXOffset !== null) {
            return {
                x: w.pageXOffset,
                y: w.pageYOffset
            };
        }
        // For IE (or any browser) in Standards mode
        var d = w.document;
        if (document.compatMode == 'CSS1Compat') {
            return {
                x: d.documentElement.scrollLeft,
                y: d.documentElement.scrollTop
            };
        }
        // For browsers in Quirks mode
        return {
            x: d.body.scrollLeft,
            y: d.body.scrollTop
        };
    }

    function Deferrer(throttleMs, debounceMs) {
        /*
            Defer image loading to load only images within a viewport's or
            two's scroll away. Done so scrolling isn't blocked on image loading
            on FXOS.

            throttleMs -- set to ms if want to load images on throttled scroll,
                          images will load WHILE user scrolls (icons).
            debounceMs -- set if want to load images on debounced scroll,
                          images will load AFTER user scrolls (screenshots).
        */
        var loadTimeout;
        var $screenshots;
        var screenshotsAlreadyLoaded = [];
        var selector;

        var scrollListener = function(e) {
            if (!$screenshots) {
               return;
            }
            loadImages();
        };
        if (debounceMs !== undefined) {
            scrollListener = _.debounce(scrollListener, debounceMs || 200);
        } else {
            scrollListener = _.throttle(scrollListener, throttleMs || 100);
        }

        // Defer image loading.
        z.doc.on('scroll', scrollListener);

        function loadImages() {
            // Calculate viewport loading boundaries.
            var pageOffset = getScrollOffsets().y;
            var viewportHeight = $(window).height();
            var viewportMin = pageOffset - viewportHeight ;  // 1 viewport back.
            viewportMin = viewportMin < 0 ? 0 : viewportMin;
            var viewportMax = pageOffset + viewportHeight * 2;  // 1 viewport ahead.

            // If images are within viewport loading boundaries, load it.
            var screenshotsNotLoaded = [];
            $screenshots.each(function(i, screenshot) {
                var y = getXYPos(screenshot).y;

                if (y > viewportMin && y < viewportMax) {
                    screenshot.onload = function() {
                        screenshot.classList.remove('deferred');  // Remove placeholder.
                    };
                    // Load image.
                    screenshot.src = screenshot.getAttribute('data-src');
                    screenshotsAlreadyLoaded.push(screenshot);
                } else {
                    screenshotsNotLoaded.push(screenshot);
                }
            });

           // Don't loop over already loaded images.
           $screenshots = $(screenshotsNotLoaded);
        }

        var setImages = function($images) {
            /* Sets the deferrer's set of images to loop over and render. */
            selector = $images.selector;

            if (screenshotsAlreadyLoaded.length) {
                // If we already loaded images, don't put them in the pool to
                // load again. Do a set difference between image sets.
                $screenshots = $($.map($images, function(image) {
                    return screenshotsAlreadyLoaded.indexOf(image) === -1;
                }));
            } else {
                $screenshots = $images;
            }

            $screenshots.attr('src', PLACEHOLDER_SRC);

            // Render images within or near the viewport.
            setTimeout(function() {
                // Let the placeholder image load first.
                z.doc.trigger('scroll');
            });
        };

        var refresh = function() {
            setImages($(selector));
        };

        var clear = function() {
            /* Used when page is rebuilt on visibility change. */
            screenshotsAlreadyLoaded = [];
            refresh();
        };
        z.win.on('unloading', clear);

        return {
            clear: clear,
            refresh: refresh,
            setImages: setImages,
        };
    }

    return {
        Deferrer: Deferrer,
    };
});
