/*
    Interface with mozApps directly if we are not packaged. Must match the
    same interface as installer_iframe which uses
    mkt/commonplace/templates/commonplace/iframe-install.html. Implementation
    should mostly match iframe-install.html but we return a promise rather
    than messaging to a parent window.
*/
define('installer_direct',
    ['defer', 'l10n', 'log', 'settings', 'z'],
    function(defer, l10n, log, settings, z) {
    'use strict';
    var gettext = l10n.gettext;
    var console = log('installer');

    function getInstalled() {
        // navigator.mozApps.getInstalled to keep track of installed apps.
        var def = defer.Deferred();

        var r = navigator.mozApps.getInstalled();
        r.onsuccess = function() {
            var installed = [];
            for (var i = 0; i < r.result.length; i++) {
                installed.push(r.result[i].manifestURL);
            }
            def.resolve(installed);
        };

        return def.promise();
    }

    function launch(manifestURL) {
        var r = navigator.mozApps.getInstalled();
        r.onsuccess = function() {
            var _installed = {};
            for (var i = 0; i < r.result.length; i++) {
                _installed[r.result[i].manifestURL] = r.result[i];
            }
            installed = _installed;

            if (callback) {
                callback();
            }
        };
    };

    function _install(product, opt) {
        console.log('Using direct installer for ' + product.manifest_url);
        var def = defer.Deferred();
        opt.data = opt.data || {};

        var manifest_url;
        if (product.manifest_url) {
            manifest_url = product.manifest_url;
        }

        var mozApps = (opt.navigator || window.navigator).mozApps;
        var installer = product.is_packaged ? 'installPackage' : 'install';
        var installRequest = mozApps[installer](manifest_url, opt.data);

        installRequest.onsuccess = function() {
            console.log('App install request for ' + product.name);
            var status;
            var isInstalled = setInterval(function() {
                status = installRequest.result.installState;
                if (status == 'installed') {
                    def.resolve();
                    clearInterval(isInstalled);
                }
            }, 250);

            installRequest.result.ondownloaderror = function(e) {
                def.reject(e.application.downloadError.name);
                clearInterval(isInstalled);
            };
        };
        installRequest.onerror = function(e) {
            def.reject(this.error.name || this.error);
        };

        return def.promise();
    }

    function install(product, opt) {
        var def = defer.Deferred();

        _install(product, opt).done(function() {
            console.log('App installed: ' + product.name);
            def.resolve({}, product);
        }).fail(function(error) {
            console.log('Install failed: ' + error);
            if (error == 'DENIED') {
                def.reject();
            } else if (error == 'NETWORK_ERROR') {
                def.reject(settings.offline_msg);
            } else {
                def.reject(gettext('App install error: {error}', {error: error}));
            }
        });

        return def.promise();
    };

    return {
        getInstalled: getInstalled,
        launch: launch,
        install: install,
    };
});
