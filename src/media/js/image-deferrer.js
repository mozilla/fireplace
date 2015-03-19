define('image-deferrer',
    ['core/urls', 'core/z', 'underscore'],
    function(urls, z, _) {
    'use strict';
    /*
       <img class="deferred" data-src="{{ image.src }}" src="{{ placeholderSrc }}">
       imageDeferrer = require('image-deferrer').ImageDeferrer(null, 200);
       imageDeferrer.setImages($('img.deferred.defer-us'));

       For background images:
       <div class="deferred-background"
            style="background-image: url({{ placeholderSrc }})"
            data-src="{{ backgroundImageSrc }}">
    */
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
        var $images;
        var imagesAlreadyLoaded = [];
        var _srcsAlreadyLoaded = [];  // Keep track of images already loaded.
        var selector;

        var scrollListener = function(e) {
            if (!$images) {
               return;
            }
            loadImages();
        };
        if (debounceMs) {
            scrollListener = _.debounce(scrollListener, debounceMs || 200);
        } else {
            scrollListener = _.throttle(scrollListener, throttleMs || 100);
        }

        // Defer image loading.
        z.win.on('scroll resize image-deferrer--load', scrollListener);

        function loadImages() {
            // Calculate viewport loading boundaries (vertical).
            var yOffset = getScrollOffsets().y;
            var viewportHeight = z.win.height();
            var minY = yOffset - viewportHeight * 0.5;  // 0.5 viewport(s) back.
            minY = minY < 0 ? 0 : minY;
            var maxY = yOffset + viewportHeight * 1.5;  // 1.5 viewport(s) ahead.

            // If images are within viewport loading boundaries, load it.
            var imagesLoading = 0;
            var imagesLoaded = 0;
            var imagesNotLoaded = [];
            $images.each(function(i, img) {
                var y = getXYPos(img).y;

                if (y > minY && y < maxY) {
                    // Load image via clone + replace. It's slower, but it
                    // looks visually smoother than changing the image's
                    // class/src in place.
                    imagesLoading++;
                    imagesAlreadyLoaded.push(img);

                    if (!img.classList.contains('deferred-background')) {
                        // Normal image defer with <img> elements. Uses a
                        // clone and replace.
                        var replace = img.cloneNode(false);
                        replace.classList.remove('deferred');
                        replace.onload = function() {
                            // Once the replace has loaded, swap and fade in.
                            if (img.parentNode === null) {
                                return;
                            }
                            img.parentNode.replaceChild(replace, img);

                            setTimeout(function() {
                                replace.style.opacity = 1;  // Fade in.
                            }, 50);

                            // Keep track of what img have already been deferred.
                            _srcsAlreadyLoaded.push(replace.src);
                            if (++imagesLoaded == imagesLoading) {
                                z.page.trigger('images_loaded');
                            }
                        };
                        replace.src = replace.getAttribute('data-src');
                        replace.style.opacity = 0.5;
                    } else {
                        // Image defer for background-imaged elements. Just
                        // updates the background-image src.
                        img.classList.remove('deferred-background');
                        var src = img.getAttribute('data-src');
                        img.style.backgroundImage = 'url(' + src + ')';

                        // Keep track of what img have already been deferred.
                        _srcsAlreadyLoaded.push(src);
                        if (++imagesLoaded == imagesLoading) {
                            z.page.trigger('images_loaded');
                        }
                    }

                } else {
                    imagesNotLoaded.push(img);
                }
            });

            if (imagesLoading === 0) {
                // No images to load? Trigger images loaded.
                z.page.trigger('images_loaded');
            }

            // Don't loop over already loaded images.
            $images = $(imagesNotLoaded);
        }

        var setImages = function($newImages) {
            /* Sets the deferrer's set of images to loop over and render. */
            selector = $newImages.selector;

            if (imagesAlreadyLoaded.length) {
                // If we already loaded images, don't put them in the pool to
                // load again. Do a set difference between image sets.
                $images = $newImages.filter(function(i) {
                    return imagesAlreadyLoaded.indexOf($images[i]) === -1;
                });
            } else {
                $images = $newImages;
            }

            // Render images within or near the viewport.
            scrollListener();
        };

        var refresh = function() {
            setImages($(selector));
        };

        var clear = function() {
            /* Used when page is rebuilt on visibility change. */
            imagesAlreadyLoaded = [];
            refresh();
        };
        z.win.on('unloading', clear);

        var getSrcsAlreadyLoaded = function() {
            return _srcsAlreadyLoaded;
        };

        return {
            clear: clear,
            refresh: refresh,
            setImages: setImages,
            getSrcsAlreadyLoaded: getSrcsAlreadyLoaded
        };
    }

    return {
        Deferrer: Deferrer,
    };
});
