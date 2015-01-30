/*
    Interface with mozApps through m.f.c iframe when we are a packaged app.
*/
define('installer_iframe',
    ['core/defer', 'core/l10n', 'core/log', 'core/settings', 'core/utils', 'core/z'],
    function(defer, l10n, log, settings, utils, z) {
    'use strict';
    var gettext = l10n.gettext;
    var console = log('installer');
    var deferreds = {
        'check-for-update': {},
        'apply-update': {}
    };

    window.addEventListener('message', function(e) {
        if (settings.iframe_installer_src.indexOf(e.origin) !== 0) {
            if (e.origin !== 'https://login.persona.org') {
                console.log(e.origin + ' origin not allowed');
            }
            return;
        }

        switch (e.data.name) {
            case 'loaded':
                return z.page.trigger('iframe-install-loaded');

            case 'install-package':
                return z.page.trigger('iframe-install-package', [e.data]);

            case 'getInstalled':
                return z.page.trigger('iframe-getInstalled', [e.data]);

            case 'check-for-update':
                return z.page.trigger('iframe-check-for-update', [e.data]);

            case 'apply-update':
                return z.page.trigger('iframe-apply-update', [e.data]);
        }
    });

    var iframe;
    function initialize_iframe() {
        var iframe_id = 'iframe-installer';
        var build_id = z.body.data('build-id-js');
        var iframe_src = settings.iframe_installer_src;
        if (build_id) {
            // If we have a build_id, we can ask zamboni to set a big max-age
            // on the response and use the build_id to cachebust it.
            iframe_src = utils.urlparams(settings.iframe_installer_src, {
                b: build_id,
                cache: 31536000
            });
        }
        if (!document.getElementById(iframe_id)) {
            iframe = document.createElement('iframe');
            iframe.id = iframe_id;
            iframe.src = iframe_src;
            iframe.height = 0;
            iframe.width = 0;
            iframe.style.borderWidth = 0;
            iframe.style.position = 'fixed';
            document.body.appendChild(iframe);
        }
    }

    // Wait for events that need to be sorted by manifest URL.
    z.page.on('iframe-check-for-update iframe-apply-update', function(e, data) {
        console.log('Received message from iframe installer (' + data.name + ')');
        var manifestURL = data.manifestURL;
        var name = data.name;
        var def = deferreds[name][manifestURL];
        if (!def) {
            return;
        }
        if (data.error) {
            def.reject(data);
        } else {
            def.resolve(data);
        }
    });

    function install(product, opt) {
        // m.f.c will receive this postMessage in `iframe-install.html`.
        console.log('Using iframe installer for ' + product.manifest_url);
        var def = defer.Deferred();

        iframe.contentWindow.postMessage({
            name: 'install-package',
            data: {
                product: product,
                opt: opt
            }
        }, '*');

        // FIXME: we are registering this everytime an app is installed, without
        // removing it once it's done. That's bad! Refactor with the deferreds
        // object above, see z.page.on('iframe...') above.
        z.page.on('iframe-install-package', function(e, data) {
            console.log('Received message from iframe installer (install-package)');
            if (data && data.name == 'install-package' && data.appId == product.id) {
                if (data.error) {
                    // Fail.
                    console.log('iframe install failed: ' + data.error.error);
                    if (data.error.error == 'DENIED') {
                        def.reject();
                        return;
                    } else if (data.error.error == 'NETWORK_ERROR') {
                        def.reject(settings.offline_msg);
                        return;
                    }
                    def.reject(gettext('App install error: {error}', data.error));
                } else {
                    // Success.
                    console.log('iframe install success');
                    def.resolve({}, data.product);
                }
            }
        });

        return def.promise();
    }

    function checkForUpdate(manifestURL) {
        console.log('Checking for update of ' + manifestURL);
        var def = deferreds['check-for-update'][manifestURL];
        if (def) {
            // There is an existing defered, abort.
            console.log('We are already checking for update of ' + manifestURL);
            return def;
        }
        def = defer.Deferred();
        deferreds['check-for-update'][manifestURL] = def;
        iframe.contentWindow.postMessage({
            name: 'check-for-update',
            manifestURL: manifestURL
        }, '*');
        return def.promise();
    }

    function applyUpdate(manifestURL) {
        console.log('Downloading update of ' + manifestURL);
        var def = deferreds['apply-update'][manifestURL];
        if (def) {
            // There is an existing defered, abort.
            console.log('We are already downloading update of ' + manifestURL);
            return def;
        }
        def = defer.Deferred();
        deferreds['apply-update'][manifestURL] = def;
        iframe.contentWindow.postMessage({
            name: 'apply-update',
            manifestURL: manifestURL
        }, '*');
        return def.promise();
    }

    function getInstalled() {
        console.log('Getting installed apps');
        var def = defer.Deferred();

        z.page.one('iframe-getInstalled', function(e, data) {
            console.log('Received message from iframe installer (getInstalled)');
            if (data && data.name == 'getInstalled') {
                console.log('Got installed apps: ' + data.result);
                z.apps = data.result;
                def.resolve(data.result);
            }
        });

        iframe.contentWindow.postMessage({
            name: 'getInstalled',
        }, '*');

        return def.promise();
    }

    function launch(manifestURL) {
        iframe.contentWindow.postMessage({
            name: 'launch-app',
            manifestURL: manifestURL
        }, '*');
    }

    return {
        applyUpdate: applyUpdate,
        checkForUpdate: checkForUpdate,
        getInstalled: getInstalled,
        initialize_iframe: initialize_iframe,
        launch: launch,
        install: install,
    };
});
