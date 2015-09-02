/*
   See: https://github.com/mozilla/fireplace/wiki/Web-Activities

   Sample usage:

   new MozActivity({
       name: 'marketplace-app',
       data: {
          manifest_url: 'http://littlealchemy.com/manifest.webapp',
          src: 'e.me'
       }
    });
    new MozActivity({
       name: 'marketplace-app',
       data: {slug: 'littlealchemy'}
    });
*/
define('webactivities',
    ['apps', 'buttons', 'core/capabilities', 'core/defer', 'core/log', 'core/login',
     'core/requests', 'core/urls', 'core/utils', 'core/z'],
    function(apps, buttons, capabilities, defer, log, login,
             req, urls, utils, z) {
    var logger = log('webactivities');

    function handleActivity(name, data, def) {
        logger.log('Handled "' + name + '" activity: ' + JSON.stringify(data));

        var activity_src = 'activity-' + name;
        var src = data.src && utils.slugify(data.src) || activity_src;
        var url, manifest_url, slug;

        switch (name) {
            case 'marketplace-app':
                // first: has this webactivity been hijacked to convey FxA login info?
                if (data.type === 'login') {
                    login.handle_fxa_login(data.auth_code, data.state);
                    break;
                }
                // If not, load up an app detail page.
                slug = data.slug;
                manifest_url = data.manifest_url || data.manifest;
                if (slug) {
                    url = urls.reverse('app', [slug]);
                    z.page.trigger('navigate',
                                   [utils.urlparams(url, {src: src})]);
                } else if (manifest_url) {
                    z.page.trigger('search', {q: ':manifest=' + manifest_url,
                                              src: src});
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
            case 'marketplace-openmobile-acl':
                logger.log('Handling openmobile-acl', data.acl_version);
                var aclVersionData = (data.acl_version || '').split(';');
                if (aclVersionData[4]) {
                    logger.log('ACL already installed', aclVersionData[4]);
                    def.reject('ACL_APP_ALREADY_INSTALLED');
                    break;
                }
                var chipsetProduct = aclVersionData[1];
                logger.log('Parsed openmobile-acl product', chipsetProduct);

                // Based on ACL version, install the respective ACL app for.
                // OpenMobile. Then we get WhatsApp and win everything.
                switch (chipsetProduct) {
                    case 'P172R12':
                        slug = 'acl-sp7715-zte_open_c2';
                        break;
                    case 'MTK6572':
                        slug = null;
                        break;
                    case 'QC8210':
                        slug = null;
                        break;
                    default:
                        logger.error('Unknown chipset', chipsetProduct);
                }

                if (slug) {
                    // Navigate to the ACL app detail page and make its install
                    // button spin to give the user something to look at while
                    // the install is in progress.
                    var buttonSelector = '.install[data-slug=' + slug + ']';
                    z.page.on('loaded', function(e) {
                        if (utils.getVars().activity_src === activity_src) {
                            // We don't want to do the spin on every page, the
                            // user might come back to the ACL detail page once
                            // the install is over. At the same time we can't
                            // wait for *just* the next 'loaded' event, because
                            // there might be 2 events fired if Marketplace was
                            // not already opened (one for the homepage, one
                            // for the detail page). So we do a check on a
                            // 'activity_src' query parameter we add when
                            // navigating to the page a few lines below.
                            buttons.spinButton($(buttonSelector));
                        }
                    });
                    z.page.trigger('navigate', [
                        utils.urlparams(urls.reverse('app', [slug]), {
                            src: src,
                            activity_src: activity_src
                        })
                    ]);
                    // Fetch ACL app data for manifest and install.
                    req
                      .get(urls.api.url('app', [slug]))
                      .done(function(app) {
                          apps.install(app, {}).then(function() {
                            apps.launch(app.manifest_url);
                            buttons.markBtnsAsInstalled();
                            def.resolve('SUCCESS');
                          }).fail(function() {
                            buttons.revertButton($(buttonSelector));
                            def.reject('COULD_NOT_INSTALL_APP');
                          });
                      });
                } else {
                    def.reject('NO_ACL_APP_FOUND_FOR_THIS_CHIPSET');
                }
                break;
        }
    }

    if (capabilities.webactivities) {
        navigator.mozSetMessageHandler('activity', function(req) {
            var def = defer.Deferred();
            def.promise().done(req.postResult).fail(req.postError);
            handleActivity(req.source.name, req.source.data, def);
        });
    }

    window.addEventListener('message', function(e) {
        // Receive postMessage from the packaged app and do something with it.
        if (e.data && e.data.name && e.data.data) {
            var def = defer.Deferred();
            logger.log('Received post message from ' + e.origin + ': ' +
                       JSON.stringify(e.data));
            if (e.data.id && e.origin) {
                def.promise().done(function(result) {
                    // If the promise is fulfilled, it means we need to call
                    // postResult... in the packaged app. So postMessage back to
                    // the parent.
                    var msg = {
                        'type': 'activity-result',
                        'id': e.data.id,
                        'name': e.data.name,
                        'result': result
                    };
                    logger.log('Posting back result for ' + e.data.name);
                    window.top.postMessage(msg, e.origin);
                }).fail(function(result) {
                    // If the promise is rejected, it means we need to call
                    // postError... in the packaged app. So postMessage back to
                    // the parent.
                    var msg = {
                        'type': 'activity-error',
                        'id': e.data.id,
                        'name': e.data.name,
                        'result': result
                    };
                    logger.log('Posting back error for ' + e.data.name);
                    window.top.postMessage(msg, e.origin);
                });
            }
            try {
                handleActivity(e.data.name, e.data.data, def);
            } catch(err) {}  // `handleActivity` can fail on bad data.
        }
    }, false);

    if (capabilities.iframed) {
        // If the Marketplace is being iframed, tell the parent window
        // (the packaged app) we've been successfully loaded.
        //
        // Let the target origin be '*' because only in Firefox OS v.1.1+ do
        // we know for certain that the origin of the Marketplace packaged app
        // will be 'app://marketplace.firefox.com'.
        logger.log('postMessaging to *: loaded');
        window.top.postMessage('loaded', '*');
    }

    return {
        handleActivity: handleActivity
    };
});
