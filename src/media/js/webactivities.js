define('webactivities', ['core/capabilities', 'core/log', 'core/login', 'core/urls', 'core/utils', 'core/z'], function(capabilities, log, login, urls, utils, z) {

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
        var url;

        switch (name) {
            case 'marketplace-app':
                // first: has this webactivity been hijacked to convey FxA login info?
                if (data.type === 'login') {
                    login.handle_fxa_login(data.auth_code, data.state);
                    break;
                }
                // If not, load up an app detail page.
                var slug = data.slug;
                var manifest_url = data.manifest_url || data.manifest;
                if (slug) {
                    url = urls.reverse('app', [slug]);
                    z.page.trigger('navigate', [utils.urlparams(url, {src: src})]);
                } else if (manifest_url) {
                    z.page.trigger('search', {q: ':manifest=' + manifest_url, src: src});
                }
                break;
            case 'marketplace-app-rating':
                // Load up the page to leave a rating for the app.
                url = urls.reverse('app/ratings/add', [data.slug]);
                z.page.trigger('navigate', [utils.urlparams(url, {src: src})]);
                break;
            case 'marketplace-category':
                // Are we trying to load langpacks ?
                if (data.slug == 'langpacks') {
                    url = urls.reverse('langpacks', [data.fxos_version]);
                } else {
                    // Load up a category page.
                    url = urls.reverse('category', [data.slug]);
                }
                z.page.trigger('navigate', [utils.urlparams(url, {src: src})]);
                break;
            case 'marketplace-search':
                if (data.type === 'firefox-os-app-stats') {
                    z.page.trigger('navigate', urls.reverse('usage'));
                    break;
                }
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
        // Receive postMessage from the packaged app and do something with it.
        if (e.data && e.data.name && e.data.data) {
            console.log('Received post message from ' + e.origin + ': ' + JSON.stringify(e.data));
            try {
                handleActivity(e.data.name, e.data.data);
            } catch(err) {}  // `handleActivity` can fail on bad data.
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
