define('webactivities',
    ['capabilities', 'urls', 'z'],
    function(capabilities, urls, z) {

    if (!capabilities.webactivities) {
        return;
    }

    // Load up an app
    navigator.mozSetMessageHandler('marketplace-app', function(req) {
        var slug = req.source.data.slug;
        z.page.trigger('navigate', [urls.reverse('app', [slug])]);
    });

    // Load up the page to leave a rating for the app.
    navigator.mozSetMessageHandler('marketplace-app-rating', function(req) {
        var slug = req.source.data.slug;
        z.page.trigger('navigate', [urls.reverse('app/ratings/add', [slug])]);
    });

    // Load up a category page
    navigator.mozSetMessageHandler('marketplace-category', function(req) {
        var slug = req.source.data.slug;
        z.page.trigger('navigate', [urls.reverse('category', [slug])]);
    });

    // Load up a search
    navigator.mozSetMessageHandler('marketplace-search', function(req) {
        var query = req.source.data.query;
        z.page.trigger('search', {q: query});
    });
});
