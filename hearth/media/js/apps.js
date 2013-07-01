/*
    Provides the apps module, a wrapper around navigator.mozApps
*/
define('apps', ['buckets', 'defer', 'underscore', 'utils'], function(buckets, defer, _, utils) {
    'use strict';

    /*

    apps.install(manifest_url, options)
    apps.installPackage(manifest_url, options)

    It's just like navigator.apps.install with the following enhancements:
    - If navigator.apps.install doesn't exist, an error is displayed
    - If the install resulted in errors, they are displayed to the user

    This requires at least one apps-error-msg div to be present.

    See also: https://developer.mozilla.org/docs/DOM/Apps.install

    The recognized option attributes are as follows:

    data
        Optional dict to pass as navigator.apps.install(url, data, ...)
    success
        Optional callback for when app installation was successful
    error
        Optional callback for when app installation resulted in error
    navigator
        Something other than the global navigator, useful for testing

    */
    function install(product, opt) {
        opt = opt || {};
        _.defaults(opt, {'navigator': navigator,
                         'data': {}});
        opt.data.categories = product.categories;
        var manifest_url;
        if (product.manifest_url) {
            manifest_url = utils.urlparams(product.manifest_url, {feature_profile: buckets.get_profile()});
        }

        var def = defer.Deferred();
        var mozApps = opt.navigator.mozApps;

        /* Try to install the app. */
        if (manifest_url && mozApps &&
            (product.is_packaged ? mozApps.installPackage : mozApps.install)) {

            var installRequest = (
                mozApps[product.is_packaged ? 'installPackage' : 'install'](manifest_url, opt.data));
            installRequest.onsuccess = function() {
                var status;
                var isInstalled = setInterval(function() {
                    status = installRequest.result.installState;
                    if (status == 'installed') {
                        clearInterval(isInstalled);
                        def.resolve(installRequest.result, product);
                    }
                    // TODO: What happens if there's an installation failure? Does this never end?
                }, 100);
            };
            installRequest.onerror = function() {
                // The JS shim still uses this.error instead of this.error.name.
                def.reject(installRequest.result, product, this.error.name || this.error);
            };
        } else {
            var reason;
            if (!manifest_url) {
                reason = 'Could not find a manifest URL in the product object.';
            } else if (product.is_packaged) {
                reason = 'Could not find platform support to install packaged app';
            } else {
                reason = 'Could not find platform support to install hosted app';
            }
            def.reject(null, product, reason);
        }
        return def.promise();
    }

    return {install: install};
});
