define('installer_mock',
    ['core/defer', 'core/l10n', 'core/log', 'core/settings', 'core/z'],
    function(defer, l10n, log, settings, z) {

    'use strict';
    var gettext = l10n.gettext;
    var logger = log('installer-mock');

    var InstallerMock = function() {
        this.manifests = [];

        // Fake for which apps "downloadAvailable" should return true.
        this.availableDownloads = {};
    };

    InstallerMock.prototype = {
        applyUpdate: function(manifestURL, opt) {
            var def = defer.Deferred();
            setTimeout(function() {
                def.resolve();
            }, 25);
            return def;
        },
        checkForUpdate: function(manifestURL, opt) {
            var def = defer.Deferred();
            var downloadAvailable = !!this.availableDownloads[manifestURL];
            setTimeout(function() {
                def.resolve(downloadAvailable);
            }, 25);
            return def;
        },
        getInstalled: function(opt) {
            var def = defer.Deferred();
            var manifests = this.manifests;
            setTimeout(function() {
                z.apps = manifests;
                def.resolve(manifests);
            }, 25);
            return def.promise();
        },
        launch: function(manifestURL) {
            logger.log('Launching ' + manifestURL);
        },
        install: function(product, opt) {
            this.manifests.push(product.manifest_url);
            var def = defer.Deferred();
            setTimeout(function() {
                def.resolve({}, product);
            }, 25);
            return def.promise();
        },
        _clearInstalled: function() {
            this.manifests = [];
        },
        _populateInstalledApps: function(n) {
            // Helper to populate installed app list with random apps.
            // Not a part of the API.
            for (var i = 0; i < (n || 200); i++) {
                this.install({
                    manifest_url: 'http://randommanifest' + i + '.com',
                });
            }
        },
        _setDownloadAvailable: function(manifestURL, val) {
            this.availableDownloads[manifestURL] = val;
        },
    };

    return InstallerMock;
});
