/*
    Interface with mozApps through m.f.c iframe when we are a packaged app.
*/
define('installer_iframe',
    ['defer', 'l10n', 'log', 'settings', 'z'],
    function(defer, l10n, log, settings, z) {
    'use strict';
    var gettext = l10n.gettext;
    var console = log('installer');

    window.addEventListener('message', function(e) {
        if (settings.iframe_installer_src.indexOf(e.origin) !== 0) {
            if (e.origin !== 'https://login.persona.org') {
                console.log(e.origin + ' origin not allowed');
            }
            return;
        }

        switch (e.data.name) {
            case 'loaded':
                return z.page.trigger('iframe-loaded');

            case 'install-package':
                return z.page.trigger('iframe-install-package', [e.data]);

            case 'getInstalled':
                return z.page.trigger('iframe-getInstalled', [e.data]);
        }
    });

    var iframe;
    function initialize_iframe() {
        var iframe_id = 'iframe-installer';
        if (!document.getElementById(iframe_id)) {
            iframe = document.createElement('iframe');
            iframe.id = iframe_id;
            iframe.src = settings.iframe_installer_src;
            iframe.height = 0;
            iframe.width = 0;
            iframe.style.borderWidth = 0;
            document.body.appendChild(iframe);
        }
    }

    function install(product, opt) {
        // m.f.c will receive this postMessage in hearth/iframe-install.html.
        console.log('Using iframe installer for ' + product.manifest_url);
        var def = defer.Deferred();

        iframe.contentWindow.postMessage({
            name: 'install-package',
            data: {
                product: product,
                opt: opt
            }
        }, '*');

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
    };

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
    };

    function launch(manifestURL) {
        iframe.contentWindow.postMessage({
            name: 'launch-app',
            manifestURL: manifestURL
        }, '*');
    };

    return {
        getInstalled: getInstalled,
        initialize_iframe: initialize_iframe,
        launch: launch,
        install: install,
    };
});
