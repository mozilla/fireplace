/*
    Interface with mozApps directly if we are not packaged. Must match the
    same interface as installer_iframe which uses
    mkt/commonplace/templates/commonplace/iframe-install.html. Implementation
    should mostly match iframe-install.html but we return a promise rather
    than messaging to a parent window.
*/
define('installer_direct',
    ['core/defer', 'core/l10n', 'core/log', 'core/settings', 'core/z'],
    function(defer, l10n, log, settings, z) {
    'use strict';
    var gettext = l10n.gettext;
    var logger = log('installer');

    function getInstalled(opt) {
        // navigator.mozApps.getInstalled to keep track of installed apps.
        opt = opt || {};
        var def = defer.Deferred();
        var mozApps = (opt.navigator || window.navigator).mozApps;
        var r = mozApps.getInstalled();
        r.onsuccess = function() {
            var installed = [];
            for (var i = 0; i < r.result.length; i++) {
                installed.push(r.result[i].manifestURL);
            }
            z.apps = installed;
            def.resolve(installed);
        };
        return def.promise();
    }

    function getApp(manifestURL, opt) {
        opt = opt || {};
        var def = defer.Deferred();
        var mozApps = (opt.navigator || window.navigator).mozApps;
        var r = mozApps.getInstalled();
        r.onsuccess = function() {
            for (var i = 0; i < r.result.length; i++) {
                if (r.result[i].manifestURL == manifestURL) {
                    def.resolve(r.result[i]);
                }
            }
            def.reject();
        };

        return def.promise();
    }

    function launch(manifestURL) {
        var r = navigator.mozApps.getInstalled();
        r.onsuccess = function() {
            var installed = {};
            for (var i = 0; i < r.result.length; i++) {
                installed[r.result[i].manifestURL] = r.result[i];
            }
            installed[manifestURL].launch();
        };
    }

    function checkForUpdate(manifestURL, opt) {
        var def = defer.Deferred();
        logger.log('Checking for update of ' + manifestURL);
        getApp(manifestURL, opt).done(function(app) {

            if (app.downloading) {
                logger.log('Checking for app update failed (APP_IS_DOWNLOADING) for ' + manifestURL);
                def.reject('APP_IS_DOWNLOADING');
                return;
            }
            if (app.downloadAvailable) {
                // If we already know an app has a download available, we can
                // return right away.
                logger.log('Checking for app update succeeded immediately (downloadavailable) for ' + manifestURL);
                def.resolve(true);
                return;
            }
            // Only one of those 2 events type is fired for success, depending
            // on whether a download is available or not.
            app.ondownloadavailable = function(e) {
                logger.log('Checking for app update succeeded (downloadavailable) for ' + manifestURL);
                def.resolve(app.downloadAvailable);
            };
            app.ondownloadapplied = function(e) {
                logger.log('Checking for app update succeeded (downloadaapplied) for ' + manifestURL);
                def.resolve(app.downloadAvailable);
            };
            var request = app.checkForUpdate();
            request.onerror = function() {
                var error = this.error.name || this.error;
                logger.log('Checking for app update failed (' + error + ') for ' + manifestURL);
                def.reject(error);
            };
        }).fail(function() {
            logger.log('Checking for app update failed (NOT_INSTALLED) for ' + manifestURL);
            def.reject('NOT_INSTALLED');
        });
        return def.promise();
    }

    function applyUpdate(manifestURL, opt) {
        var def = defer.Deferred();
        logger.log('Applying update of ' + manifestURL);
        getApp(manifestURL, opt).done(function(app) {
            app.ondownloadsuccess = function(e) {
                logger.log('Applying app update succeeded (downloadsuccess) for ' + manifestURL);
                def.resolve();
            };
            app.ondownloaderror = function(e) {
                logger.log('Applying app update failed (downloaderror) for ' + manifestURL);
                def.reject(e.application.downloadError.name);
            };
            if (app.downloading) {
                def.reject('APP_IS_DOWNLOADING');
                return;
            }
            if (!app.downloadAvailable) {
                def.reject('NO_DOWNLOAD_AVAILABLE');
                return;
            }
            app.download();
        }).fail(function() {
            def.reject('NOT_INSTALLED');
        });
        return def.promise();
    }

    function _install(product, opt) {
        logger.log('Using direct installer for ' + product.manifest_url);
        var def = defer.Deferred();
        opt.data = opt.data || {};

        var manifest_url;
        if (product.manifest_url) {
            manifest_url = product.manifest_url;
        }

        var mozApps = (opt.navigator || window.navigator).mozApps;
        var installer = product.is_packaged ? 'installPackage' : 'install';
        if (!mozApps[installer]) {
            return def.reject(gettext('Unable to install packaged apps')).promise();
        }
        var installRequest = mozApps[installer](manifest_url, opt.data);

        installRequest.onsuccess = function() {
            logger.log('App install request for ' + product.name);
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
            logger.log('App installed: ' + product.name);
            def.resolve({}, product);
        }).fail(function(error) {
            logger.log('Install failed: ' + error);
            if (error == 'DENIED') {
                def.reject();
            } else if (error == 'NETWORK_ERROR') {
                def.reject(gettext('Sorry, we had trouble fetching this app\'s data. Please try again later.'));
            } else {
                def.reject(gettext('App install error: {error}', {error: error}));
            }
        });

        return def.promise();
    }

    return {
        applyUpdate: applyUpdate,
        checkForUpdate: checkForUpdate,
        getInstalled: getInstalled,
        launch: launch,
        install: install,
    };
});
