define('webactivities', ['capabilities', 'log', 'urls', 'utils', 'z'], function(capabilities, log, urls, utils, z) {

    // See https://github.com/mozilla/fireplace/wiki/Web-Activities
    //
    // Sample usage:
    //
    // new MozActivity({
    //     name: 'marketplace-app',
    //     data: {manifest_url: 'http://littlealchemy.com/manifest.webapp', src: 'e.me'}
    // });
    //
    // new MozActivity({
    //     name: 'marketplace-app',
    //     data: {slug: 'littlealchemy'}
    // });

    var console = log('webactivities');

    function handleActivity(name, data) {
        console.log('Handled "' + name + '" activity: ' + JSON.stringify(data));

        var src = data.src && utils.slugify(data.src) || 'activity-' + name;

        switch (name) {
            case 'marketplace-app':
                // Load up an app detail page.
                var slug = data.slug;
                var manifest_url = data.manifest_url || data.manifest;
                if (slug) {
                    var url = urls.reverse('app', [slug]);
                    z.page.trigger('navigate', [utils.urlparams(url, {src: src})]);
                } else if (manifest_url) {
                    z.page.trigger('search', {q: ':manifest=' + manifest_url, src: src});
                }
                break;
            case 'marketplace-app-rating':
                // Load up the page to leave a rating for the app.
                var url = urls.reverse('app/ratings/add', [data.slug]);
                z.page.trigger('navigate', [utils.urlparams(url, {src: src})]);
                break;
            case 'marketplace-category':
                // Load up a category page.
                var url = urls.reverse('category', [data.slug]);
                z.page.trigger('navigate', [utils.urlparams(url, {src: src})]);
                break;
            case 'marketplace-search':
                // Load up a search.
                z.page.trigger('search', {q: data.query, src: src});
                break;
        }
    }

    if (capabilities.webactivities) {
        navigator.mozSetMessageHandler('activity', function(req) {
            handleActivity(req.source.name, req.source.data);
        });
    }

    window.addEventListener('message', function(e) {
        console.log('Received post message from ' + e.origin + ': ' + JSON.stringify(e.data));
        // Receive postMessage from the packaged app and do something with it.
        if (e.data && e.data.name && e.data.data) {
            handleActivity(e.data.name, e.data.data);
        }
    }, false);

    if (window.self !== window.top) {
        // If the Marketplace is being iframed, tell the parent window
        // (the packaged app) we've been successfully loaded.
        //
        // Let the target origin be '*' because only in Firefox OS v.1.1+ do
        // we know for certain that the origin of the Marketplace packaged app
        // will be 'app://marketplace.firefox.com'.
        console.log('postMessaging to *: loaded');
        window.top.postMessage('loaded', '*');
    }

});
