/*
    Initialize the image deferrer for the Marketplace.
*/
define('image-deferrer-mkt',
    ['image-deferrer', 'core/nunjucks', 'core/z'],
    function(ImageDeferrer, nunjucks, z) {
    'use strict';

    var throttledDeferrer = ImageDeferrer.Deferrer(100, null);
    var debouncedDeferrer = ImageDeferrer.Deferrer(null, 200);

    z.page.one('loaded', function() {
        throttledDeferrer.setImages($('.icon.deferred'));
        debouncedDeferrer.setImages($('.previews-thumbnail .deferred, .deferred-background, .deferred.feed-landing-bg-image'));
    }).on('loaded loaded_more navigate fragment_loaded', function() {
        throttledDeferrer.refresh();
        debouncedDeferrer.refresh();
    });

    nunjucks.require('globals').imgAlreadyDeferred = function(src) {
        /*
            If an image already has been loaded, we use this helper in case the
            view is triggered to be rebuilt. When pages are rebuilt, we don't
            mark images to be deferred if they have already been loaded.
            This fixes images flashing back to the placeholder image when
            switching between the New and Popular tabs on the home page.
        */
        var iconsLoaded = throttledDeferrer.getSrcsAlreadyLoaded();
        var screenshotsLoaded = debouncedDeferrer.getSrcsAlreadyLoaded();
        var loaded = iconsLoaded.concat(screenshotsLoaded);
        return loaded.indexOf(src) !== -1;
    };
});
